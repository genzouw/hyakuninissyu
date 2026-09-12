#!/usr/bin/env python3
"""漏洩防止の保護対象パターンが各防御層に行き渡っているかを検証する。

単一ソース ``docs/security/protected-patterns.json`` に定義された各パターンから
代表パスを生成し、以下 4 層それぞれが実際にそのパスを保護するかを確認する。

- gitignore      : ``git check-ignore`` で無視対象かを判定
- gitattributes  : ``git check-attr diff`` で diff が unset かを判定
- vscode-files   : ``.vscode/settings.json`` の files.exclude で除外されるかを判定
- vscode-search  : ``.vscode/settings.json`` の search.exclude で除外されるかを判定
- precommit      : ``.pre-commit-config.yaml`` の forbid-sensitive-files にマッチするかを判定

設定ファイルの文字列表現を突き合わせるのではなく、代表パスに対する各層の「振る舞い」を
検証する。``**/`` の有無のような等価な表記揺れを差分として報告せず、防御の穴だけを
検出するためである。

なお本スクリプトは検証のみを行い、設定ファイルの自動生成・自動書き換えは行わない。
差分が出た場合は各設定ファイルを手動で更新すること。
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

LAYERS = ("gitignore", "gitattributes", "vscode-files", "vscode-search", "precommit")
VSCODE_SECTIONS = {"vscode-files": "files.exclude", "vscode-search": "search.exclude"}

DATA_PATH = Path("docs/security/protected-patterns.json")
GITATTRIBUTES_PATH = Path(".gitattributes")
VSCODE_SETTINGS_PATH = Path(".vscode/settings.json")
PRE_COMMIT_CONFIG_PATH = Path(".pre-commit-config.yaml")
SENSITIVE_FILES_HOOK_ID = "forbid-sensitive-files"

LAYER_HINTS = {
    "gitignore": ".gitignore に追跡除外のパターンを追加してください",
    "gitattributes": ".gitattributes に `<パターン> -diff` を追加してください",
    "vscode-files": ".vscode/settings.json の files.exclude に追加してください",
    "vscode-search": ".vscode/settings.json の search.exclude に追加してください",
    "precommit": f".pre-commit-config.yaml の {SENSITIVE_FILES_HOOK_ID} フックの files に追加してください",
}


class CheckError(Exception):
    """検証そのものが実施できない状態を表す。"""


# --------------------------------------------------------------------------
# データソースの読み込み
# --------------------------------------------------------------------------


def load_data(path: Path) -> dict:
    try:
        with path.open(encoding="utf-8") as fp:
            return json.load(fp)
    except FileNotFoundError as exc:
        raise CheckError(f"単一ソースが見つかりません: {path}") from exc
    except json.JSONDecodeError as exc:
        raise CheckError(f"単一ソースの JSON が不正です: {path}: {exc}") from exc


def samples_for(pattern: dict) -> list[str]:
    """パターンから検証用の代表パスを求める。"""
    if "samples" in pattern:
        return list(pattern["samples"])

    kind = pattern.get("kind")
    value = pattern.get("value")
    if not kind or not value:
        raise CheckError(f"kind と value は必須です: {pattern!r}")

    if kind == "ext":
        return [f"sample.{value}", f"nested/dir/sample.{value}"]
    if kind == "dir":
        return [f"{value}/sample.txt", f"nested/dir/{value}/sample.txt"]
    if kind == "file":
        return [value, f"nested/dir/{value}"]
    if kind == "glob":
        raise CheckError(f"kind が glob のパターンには samples が必須です: {value}")
    raise CheckError(f"未知の kind です: {kind}")


def expand(data: dict) -> list[dict]:
    """カテゴリ構造を (層, パス) の検証単位へ展開する。"""
    expanded = []
    for category in data.get("categories", []):
        for pattern in category.get("patterns", []):
            layers = pattern.get("layers", LAYERS)
            unknown = set(layers) - set(LAYERS)
            if unknown:
                raise CheckError(f"未知の層です: {sorted(unknown)} ({pattern.get('value')})")
            expanded.append(
                {
                    "category": category["name"],
                    "label": pattern.get("value", "?"),
                    "layers": list(layers),
                    "samples": samples_for(pattern),
                }
            )
    return expanded


def allowlist_entries(data: dict) -> list[dict]:
    entries = []
    for entry in data.get("allowlist", []):
        layers = entry.get("layers", LAYERS)
        unknown = set(layers) - set(LAYERS)
        if unknown:
            raise CheckError(f"未知の層です: {sorted(unknown)} ({entry.get('path')})")
        entries.append({"path": entry["path"], "layers": list(layers)})
    return entries


# --------------------------------------------------------------------------
# 各層の判定
# --------------------------------------------------------------------------


def git_ignored(paths: list[str], cwd: Path) -> set[str]:
    """git の無視ルールで除外されるパスの集合を返す。"""
    # --no-index: 追跡済みかどうかに関係なく .gitignore の評価結果だけを見る
    result = subprocess.run(
        ["git", "check-ignore", "--no-index", "--stdin", "-z"],
        input="\0".join(paths).encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=cwd,
    )
    # 0: 一部でも無視される / 1: どれも無視されない。それ以外は異常
    if result.returncode not in (0, 1):
        raise CheckError(
            "git check-ignore の実行に失敗しました: " + result.stderr.decode("utf-8", "replace").strip()
        )
    return {item for item in result.stdout.decode("utf-8").split("\0") if item}


def git_diff_suppressed(paths: list[str], cwd: Path) -> set[str]:
    """diff 属性が unset（diff 出力が抑止される）なパスの集合を返す。"""
    result = subprocess.run(
        ["git", "check-attr", "--stdin", "-z", "diff"],
        input="\0".join(paths).encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=cwd,
    )
    if result.returncode != 0:
        raise CheckError(
            "git check-attr の実行に失敗しました: " + result.stderr.decode("utf-8", "replace").strip()
        )
    fields = result.stdout.decode("utf-8").split("\0")
    suppressed = set()
    # 出力は <path>\0<attr>\0<value>\0 の繰り返し
    for index in range(0, len(fields) - 2, 3):
        if fields[index + 2] == "unset":
            suppressed.add(fields[index])
    return suppressed


def compile_vscode_glob(pattern: str) -> re.Pattern:
    """VS Code の exclude glob を正規表現へ変換する。"""
    out = []
    index = 0
    length = len(pattern)
    while index < length:
        if pattern.startswith("**/", index):
            out.append("(?:[^/]+/)*")
            index += 3
        elif pattern.startswith("**", index):
            out.append(".*")
            index += 2
        elif pattern[index] == "*":
            out.append("[^/]*")
            index += 1
        elif pattern[index] == "?":
            out.append("[^/]")
            index += 1
        elif pattern[index] == "[":
            close = pattern.find("]", index + 1)
            if close == -1:
                out.append(re.escape(pattern[index]))
                index += 1
            else:
                out.append(pattern[index : close + 1])
                index = close + 1
        else:
            out.append(re.escape(pattern[index]))
            index += 1
    return re.compile("".join(out))


class VscodeExcludes:
    """files.exclude / search.exclude の判定器。"""

    def __init__(self, settings: dict) -> None:
        self.sections = {}
        for layer, key in VSCODE_SECTIONS.items():
            section = settings.get(key)
            if section is None:
                raise CheckError(f"{VSCODE_SETTINGS_PATH} に {key} がありません")
            # 値が false のエントリはパターンを無効化するだけで、他のパターンによる
            # 除外を打ち消さない。VS Code の実挙動に合わせて true のみを採用する
            self.sections[layer] = [
                compile_vscode_glob(glob) for glob, enabled in section.items() if enabled is True
            ]

    @staticmethod
    def _ancestors(path: str) -> list[str]:
        parts = path.split("/")
        return ["/".join(parts[: index + 1]) for index in range(len(parts))]

    def excluded(self, layer: str, path: str) -> bool:
        """layer が示すセクションで path が除外されるか。

        親ディレクトリが除外されればその配下も除外されるため、祖先パスも判定する。
        """
        candidates = self._ancestors(path)
        return any(rx.fullmatch(candidate) for rx in self.sections[layer] for candidate in candidates)


def extract_hook_regexes(text: str, hook_id: str) -> tuple[str, str | None]:
    """pre-commit フックの files / exclude をブロックスカラーごと取り出す。

    PyYAML への依存を避けるため、インデントだけを頼りに抽出する。
    """
    lines = text.splitlines()
    hook_indent = None
    body: list[str] = []
    for line in lines:
        stripped = line.strip()
        if hook_indent is None:
            match = re.match(r"^(\s*)-\s+id:\s*" + re.escape(hook_id) + r"\s*$", line)
            if match:
                hook_indent = len(match.group(1))
            continue
        if not stripped:
            body.append(line)
            continue
        indent = len(line) - len(line.lstrip())
        if indent <= hook_indent:
            break
        body.append(line)

    if hook_indent is None:
        raise CheckError(f"{PRE_COMMIT_CONFIG_PATH} に {hook_id} フックが見つかりません")

    values: dict[str, str] = {}
    index = 0
    while index < len(body):
        line = body[index]
        match = re.match(r"^(\s*)(files|exclude):\s*(.*)$", line)
        if not match:
            index += 1
            continue
        key_indent, key, inline = len(match.group(1)), match.group(2), match.group(3).strip()
        index += 1
        if inline and not inline.startswith((">", "|")):
            values[key] = inline.strip("'\"")
            continue
        collected = []
        while index < len(body):
            nested = body[index]
            if not nested.strip():
                index += 1
                continue
            if len(nested) - len(nested.lstrip()) <= key_indent:
                break
            collected.append(nested.strip())
            index += 1
        values[key] = "\n".join(collected)

    if "files" not in values:
        raise CheckError(f"{hook_id} フックに files がありません")
    return values["files"], values.get("exclude")


class SensitiveFilesHook:
    """forbid-sensitive-files フックの判定器。"""

    def __init__(self, files_pattern: str, exclude_pattern: str | None) -> None:
        # ブロックスカラーを行単位で連結しているため、verbose フラグが前提になる
        if not re.match(r"^\(\?[a-z]*x[a-z]*\)", files_pattern.strip()):
            raise CheckError(
                f"{SENSITIVE_FILES_HOOK_ID} の files は verbose フラグ (?x) 付きである前提です。"
                "フラグを変更する場合は本スクリプトの抽出方法も見直してください"
            )
        try:
            self.files = re.compile(files_pattern)
            self.exclude = re.compile(exclude_pattern) if exclude_pattern else None
        except re.error as exc:
            raise CheckError(f"{SENSITIVE_FILES_HOOK_ID} の正規表現が不正です: {exc}") from exc

    def blocks(self, path: str) -> bool:
        # pre-commit は files / exclude ともに re.search で評価する
        if not self.files.search(path):
            return False
        if self.exclude and self.exclude.search(path):
            return False
        return True


# --------------------------------------------------------------------------
# 検証本体
# --------------------------------------------------------------------------


def repo_root() -> Path:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise CheckError("git リポジトリのルートを特定できませんでした")
    return Path(result.stdout.decode("utf-8").strip())


def check(root: Path, data: dict) -> list[str]:
    """不足を表すメッセージの一覧を返す。空なら差分なし。"""
    patterns = expand(data)
    allowed = allowlist_entries(data)

    all_paths = sorted({sample for item in patterns for sample in item["samples"]})
    all_paths += sorted({entry["path"] for entry in allowed})

    if not GITATTRIBUTES_PATH.is_file():
        raise CheckError(f"{GITATTRIBUTES_PATH} が見つかりません")
    ignored = git_ignored(all_paths, root)
    suppressed = git_diff_suppressed(all_paths, root)

    try:
        with (root / VSCODE_SETTINGS_PATH).open(encoding="utf-8") as fp:
            settings = json.load(fp)
    except FileNotFoundError as exc:
        raise CheckError(f"{VSCODE_SETTINGS_PATH} が見つかりません") from exc
    except json.JSONDecodeError as exc:
        raise CheckError(f"{VSCODE_SETTINGS_PATH} の JSON が不正です: {exc}") from exc
    vscode = VscodeExcludes(settings)

    try:
        config_text = (root / PRE_COMMIT_CONFIG_PATH).read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise CheckError(f"{PRE_COMMIT_CONFIG_PATH} が見つかりません") from exc
    hook = SensitiveFilesHook(*extract_hook_regexes(config_text, SENSITIVE_FILES_HOOK_ID))

    problems: list[str] = []

    for item in patterns:
        for sample in item["samples"]:
            for layer in item["layers"]:
                if layer == "gitignore" and sample not in ignored:
                    problems.append(
                        f"[{layer}] {item['label']} ({item['category']}): "
                        f"`{sample}` が無視されません。{LAYER_HINTS[layer]}"
                    )
                elif layer == "gitattributes" and sample not in suppressed:
                    problems.append(
                        f"[{layer}] {item['label']} ({item['category']}): "
                        f"`{sample}` の diff が抑止されません。{LAYER_HINTS[layer]}"
                    )
                elif layer in VSCODE_SECTIONS and not vscode.excluded(layer, sample):
                    problems.append(
                        f"[{layer}] {item['label']} ({item['category']}): "
                        f"`{sample}` が {VSCODE_SECTIONS[layer]} で除外されません。{LAYER_HINTS[layer]}"
                    )
                elif layer == "precommit" and not hook.blocks(sample):
                    problems.append(
                        f"[{layer}] {item['label']} ({item['category']}): "
                        f"`{sample}` がブロックされません。{LAYER_HINTS[layer]}"
                    )

    for entry in allowed:
        path = entry["path"]
        for layer in entry["layers"]:
            if layer == "gitignore" and path in ignored:
                problems.append(f"[{layer}] 許可対象 `{path}` が無視されています")
            elif layer == "gitattributes" and path in suppressed:
                problems.append(f"[{layer}] 許可対象 `{path}` の diff が抑止されています")
            elif layer in VSCODE_SECTIONS and vscode.excluded(layer, path):
                problems.append(
                    f"[{layer}] 許可対象 `{path}` が {VSCODE_SECTIONS[layer]} で除外されています"
                )
            elif layer == "precommit" and hook.blocks(path):
                problems.append(f"[{layer}] 許可対象 `{path}` がブロックされています")

    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--data",
        default=None,
        help=f"単一ソースのパス（既定: {DATA_PATH}）",
    )
    parser.add_argument("filenames", nargs="*", help="pre-commit から渡されるファイル名（未使用）")
    args = parser.parse_args(argv)

    try:
        root = repo_root()
        data_path = Path(args.data) if args.data else root / DATA_PATH
        problems = check(root, load_data(data_path))
    except CheckError as exc:
        print(f"保護対象パターンの検証を実施できませんでした: {exc}", file=sys.stderr)
        return 2

    if problems:
        print(
            "保護対象パターンが防御層に行き渡っていません "
            f"({DATA_PATH} との差分 {len(problems)} 件):",
            file=sys.stderr,
        )
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        print(
            "\n設定ファイルを修正するか、意図的な非対称性であれば "
            f"{DATA_PATH} の layers / note を更新してください。",
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
