#!/usr/bin/env python3
"""AGENTS.md と jules-prompt.md の「既に動いているツール」表の同期を検証する。

``docs/agents/jules-prompt.md`` は Jules に貼り付けて単体で読ませるため、
``AGENTS.md`` 2 章「既に動いているツール」の表を写しとして持っている。
写しは片方だけ更新されてずれやすいので、以下を検査する。

- 2 つの表の「種別」「ツール / 設定ファイル」列が、行の順序まで含めて一致すること
- 「ツール / 設定ファイル」列にバッククォートで書かれたパスが、リポジトリに実在すること

「役割」列は比較しない。jules-prompt.md は単体で読ませる前提のため、
AGENTS.md の章番号参照 (例: 「§1 違反」) を言い換えており、意図的に差分があるためである。

なお本スクリプトは検証のみを行い、表の自動生成・自動書き換えは行わない。
差分が出た場合は両ファイルを手動で更新すること。
"""

from __future__ import annotations

import argparse
import difflib
import re
import sys
from pathlib import Path

SOURCE_PATH = Path("AGENTS.md")
COPY_PATH = Path("docs/agents/jules-prompt.md")

# 見出しレベルや章番号の有無が両ファイルで異なるため、見出し文言だけで判定する
HEADING_RE = re.compile(r"^#+\s*(?:\d+\.\s*)?既に動いているツール")
SEPARATOR_CELL_RE = re.compile(r"^:?-+:?$")
CODE_SPAN_RE = re.compile(r"`([^`]+)`")

# 比較する列 (0 始まり): 種別, ツール / 設定ファイル
COMPARED_COLUMNS = 2
TOOL_COLUMN = 1


class CheckError(Exception):
    """検証そのものが実施できない状態を表す。"""


def split_row(line: str) -> list[str]:
    """Markdown 表の 1 行をセルのリストに分割する (前後の空白は除去)。"""
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def extract_table(text: str) -> list[list[str]]:
    """「既に動いているツール」見出し直後の表から、ヘッダーと区切り行を除いた行を返す。"""
    lines = text.splitlines()
    start = next((i for i, line in enumerate(lines) if HEADING_RE.match(line)), None)
    if start is None:
        raise CheckError("「既に動いているツール」見出しが見つかりません")

    rows: list[list[str]] = []
    in_table = False
    for line in lines[start + 1 :]:
        if line.startswith("#"):
            break
        if line.lstrip().startswith("|"):
            in_table = True
            rows.append(split_row(line))
        elif in_table:
            break

    if len(rows) < 2 or not all(SEPARATOR_CELL_RE.match(cell) for cell in rows[1]):
        raise CheckError("「既に動いているツール」見出しの直後に Markdown 表が見つかりません")
    return rows[2:]


def compared_key(row: list[str]) -> str:
    return " | ".join(row[:COMPARED_COLUMNS])


def diff_tables(source: list[list[str]], copy: list[list[str]]) -> list[str]:
    """比較対象列の差分を unified diff 形式で返す (一致していれば空リスト)。"""
    return list(
        difflib.unified_diff(
            [compared_key(row) for row in source],
            [compared_key(row) for row in copy],
            fromfile=str(SOURCE_PATH),
            tofile=str(COPY_PATH),
            lineterm="",
        )
    )


def referenced_paths(rows: list[list[str]]) -> list[str]:
    """「ツール / 設定ファイル」列のバッククォート内のうち、パスとみなせるものを返す。"""
    paths: list[str] = []
    for row in rows:
        if len(row) <= TOOL_COLUMN:
            continue
        for token in CODE_SPAN_RE.findall(row[TOOL_COLUMN]):
            if ("/" in token or "." in token) and token not in paths:
                paths.append(token)
    return paths


def missing_paths(root: Path, rows: list[list[str]]) -> list[str]:
    return [path for path in referenced_paths(rows) if not (root / path).exists()]


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise CheckError(f"{path} を読み込めません: {exc}") from exc


def check(root: Path) -> list[str]:
    """問題点のメッセージを返す (問題がなければ空リスト)。"""
    problems: list[str] = []
    tables = {}
    for path in (SOURCE_PATH, COPY_PATH):
        try:
            tables[path] = extract_table(read_text(root / path))
        except CheckError as exc:
            raise CheckError(f"{path}: {exc}") from exc

    diff = diff_tables(tables[SOURCE_PATH], tables[COPY_PATH])
    if diff:
        problems.append(
            "2 つの表の「種別」「ツール / 設定ファイル」列が一致しません:\n" + "\n".join(diff)
        )

    for path, rows in tables.items():
        for missing in missing_paths(root, rows):
            problems.append(f"{path} の表に記載された `{missing}` がリポジトリに存在しません")
    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("filenames", nargs="*", help="pre-commit から渡されるファイル名（未使用）")
    parser.parse_args(argv)

    root = Path(__file__).resolve().parent.parent
    try:
        problems = check(root)
    except CheckError as exc:
        print(f"「既に動いているツール」表の検証を実施できませんでした: {exc}", file=sys.stderr)
        return 2

    if problems:
        print("「既に動いているツール」表に問題があります:", file=sys.stderr)
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        print(
            f"\n{SOURCE_PATH} を正として {COPY_PATH} の表を合わせ、"
            "記載したパスが実在することを確認してください。",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
