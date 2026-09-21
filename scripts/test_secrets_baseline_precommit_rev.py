#!/usr/bin/env python3
"""``.secrets.baseline`` の ``rev:`` 除外フィルタの挙動を固定する回帰テスト。

``.pre-commit-config.yaml`` の ``rev:`` には pre-commit フックを固定する 40 桁の
コミット SHA が書かれており、detect-secrets はこれを ``Hex High Entropy String``
として検出する。ベースラインにハッシュ値で記録する方式では、Dependabot が rev を
更新するたびに記録と実値が食い違って CI が落ちるため、
``detect_secrets.filters.regex.should_exclude_line`` で ``rev:`` 行そのものを
走査対象から外している。

このテストが固定したい挙動は 2 つある。

1. **クォートの罠**: detect-secrets は YAML を正規化してからフィルタに渡すため、
   フィルタが受け取る行は ``rev: "b859c0df..."`` のように値が引用符で囲まれた形になる。
   ``^\\s*rev: [0-9a-f]{40}`` と書くと一致せず、**フィルタが無言で効かない**状態になる。
2. **rev 更新への耐性**: 将来 rev が別の SHA に更新されても検出されないこと。

正規表現を Python 側で再実装するのではなく detect-secrets 本体を実行するのは、
検証したいのが「本リポジトリのベースラインを detect-secrets が解釈した結果」そのものだから
である（``scripts/test_gitleaks_pii_email.py`` と同じ方針）。

あわせて、除外フィルタを外したベースラインで同じ入力が**検出される**ことも確認している。
これが無いと、detect-secrets 側の仕様変更などでフックが常に成功するようになった場合に、
本テストが素通りしていることに気づけない。

detect-secrets のバージョンは ``requirements.txt`` で固定しており、CI では
``pip install -r requirements.txt``（``.github/workflows/pre-commit.yml``）で導入される。
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess  # nosec B404
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BASELINE_PATH = REPO_ROOT / ".secrets.baseline"
PRE_COMMIT_CONFIG_PATH = REPO_ROOT / ".pre-commit-config.yaml"

EXCLUDE_LINE_FILTER = "detect_secrets.filters.regex.should_exclude_line"

# 40 桁 hex のリテラルをこのファイル内に残さないよう、実行時に組み立てる。
# リテラルで書くと本テスト自身が detect-secrets / gitleaks の検出対象になり得る。
FAKE_SHA = "dead" + "beef" * 9


def load_baseline() -> dict:
    return json.loads(BASELINE_PATH.read_text(encoding="utf-8"))


def exclude_line_patterns(baseline: dict) -> list[str]:
    """ベースラインから ``should_exclude_line`` の ``pattern`` を取り出す。"""
    for filter_used in baseline.get("filters_used", []):
        if filter_used.get("path") == EXCLUDE_LINE_FILTER:
            return list(filter_used.get("pattern", []))
    raise AssertionError(
        f"{BASELINE_PATH.name} に {EXCLUDE_LINE_FILTER} フィルタがありません。"
        "rev ピンの除外が外れると、pre-commit の rev 更新のたびに CI が落ちます。"
    )


def compiled_exclude_regex() -> re.Pattern[str]:
    """detect-secrets と同じ方法（``|`` 連結）でパターンを 1 本の正規表現にする。

    参考: detect_secrets/filters/regex.py の ``_get_line_regex``
    """
    return re.compile("|".join(exclude_line_patterns(load_baseline())))


def remove_exclude_line_filter(baseline: dict) -> dict:
    """``should_exclude_line`` フィルタを取り除いたベースラインを返す（陽性コントロール用）。"""
    stripped = dict(baseline)
    stripped["filters_used"] = [
        filter_used
        for filter_used in baseline.get("filters_used", [])
        if filter_used.get("path") != EXCLUDE_LINE_FILTER
    ]
    return stripped


class ExcludePatternTest(unittest.TestCase):
    """``pattern`` そのものの一致範囲。detect-secrets に依存せず検証できる。"""

    @classmethod
    def setUpClass(cls) -> None:
        cls.regex = compiled_exclude_regex()

    def assertExcluded(self, line: str) -> None:
        self.assertIsNotNone(
            self.regex.search(line),
            f"`{line}` は除外対象であるべきです",
        )

    def assertNotExcluded(self, line: str) -> None:
        self.assertIsNone(
            self.regex.search(line),
            f"`{line}` は除外対象であるべきではありません",
        )

    def test_引用符付きのrev行を除外する(self):
        # detect-secrets が YAML を正規化した後に渡してくる形。
        self.assertExcluded(f'    rev: "{FAKE_SHA}"')

    def test_引用符なしのrev行を除外する(self):
        # .pre-commit-config.yaml にそのまま書かれている形。
        self.assertExcluded(f"    rev: {FAKE_SHA}")

    def test_インデントが無いrev行も除外する(self):
        self.assertExcluded(f"rev: {FAKE_SHA}")

    def test_タグ形式のrevは除外対象外(self):
        self.assertNotExcluded("    rev: v1.5.0")

    def test_rev以外のキーは除外対象外(self):
        # 除外を `rev:` キーに限定していることの確認。
        self.assertNotExcluded(f"    sha: {FAKE_SHA}")
        self.assertNotExcluded(f"    token: {FAKE_SHA}")

    def test_40桁未満のhexは除外対象外(self):
        self.assertNotExcluded(f"    rev: {FAKE_SHA[:39]}")


class DetectSecretsHookTest(unittest.TestCase):
    """detect-secrets 本体を実行して、ベースライン全体の解釈結果を固定する。"""

    detect_secrets_hook: str

    @classmethod
    def setUpClass(cls) -> None:
        hook = shutil.which("detect-secrets-hook")
        if hook is None:
            message = (
                "detect-secrets-hook が PATH にありません。"
                "`pip install -r requirements.txt` で導入してください。"
            )
            if os.environ.get("CI"):
                # CI では導入ステップが失敗している可能性があるため、
                # 黙ってスキップして検証が素通りすることを防ぐ。
                raise AssertionError(message)
            raise unittest.SkipTest(message)
        cls.detect_secrets_hook = hook

    def run_hook(self, baseline: dict, config_text: str) -> subprocess.CompletedProcess:
        """一時リポジトリ上で ``detect-secrets-hook`` を実行する。

        detect-secrets-hook はベースラインの更新判定に ``git diff`` を使うため、
        git リポジトリの外で実行すると内容によらず失敗する。検証対象の挙動と
        区別できなくなるので、一時ディレクトリを ``git init`` してから実行する。
        """
        with tempfile.TemporaryDirectory() as workdir:
            work = Path(workdir)
            subprocess.run(  # nosec B603 B607
                ["git", "init", "--quiet", "."],
                cwd=work,
                capture_output=True,
                check=True,
            )
            baseline_path = work / ".secrets.baseline"
            baseline_path.write_text(json.dumps(baseline, indent=2), encoding="utf-8")
            config_path = work / PRE_COMMIT_CONFIG_PATH.name
            config_path.write_text(config_text, encoding="utf-8")

            return subprocess.run(  # nosec B603
                [
                    self.detect_secrets_hook,
                    "--baseline",
                    baseline_path.name,
                    config_path.name,
                ],
                cwd=work,
                capture_output=True,
                text=True,
                check=False,
            )

    def assertNoSecretDetected(self, completed: subprocess.CompletedProcess) -> None:
        self.assertEqual(
            completed.returncode,
            0,
            "detect-secrets が新規シークレットを検出しました:\n"
            f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}",
        )

    def test_現在のrevピンは検出されない(self):
        completed = self.run_hook(
            load_baseline(),
            PRE_COMMIT_CONFIG_PATH.read_text(encoding="utf-8"),
        )
        self.assertNoSecretDetected(completed)

    def test_revが更新されても検出されない(self):
        # Dependabot による将来の rev 更新を再現する。ベースラインは現状のまま、
        # rev の値だけを別の SHA に置き換えても検出されないことを確認する。
        rewritten = re.sub(
            r"(?m)^(\s*rev: )[0-9a-f]{40}",
            lambda match: match.group(1) + FAKE_SHA,
            PRE_COMMIT_CONFIG_PATH.read_text(encoding="utf-8"),
        )
        self.assertIn(FAKE_SHA, rewritten, "rev の置換に失敗しました（テストの前提が壊れています）")
        completed = self.run_hook(load_baseline(), rewritten)
        self.assertNoSecretDetected(completed)

    def test_除外フィルタを外すと検出される(self):
        # 陽性コントロール。これが失敗する場合、上の 2 つは
        # 「フィルタが効いている」ことを何も保証していない。
        completed = self.run_hook(
            remove_exclude_line_filter(load_baseline()),
            PRE_COMMIT_CONFIG_PATH.read_text(encoding="utf-8"),
        )
        self.assertNotEqual(
            completed.returncode,
            0,
            "除外フィルタを外しても検出されませんでした。"
            "本テストは rev 行の除外を検証できていません。",
        )
        self.assertIn(PRE_COMMIT_CONFIG_PATH.name, completed.stdout + completed.stderr)


if __name__ == "__main__":
    unittest.main()
