#!/usr/bin/env python3
"""AI エージェント向け指示ファイルの「最重要原則」節の同期を検証する。

Cursor・Windsurf・Cline・Copilot はそれぞれ自分の指示ファイルだけを読むため、
``CLAUDE.md`` 冒頭の「## 最重要原則」節 (採用可否を決める規則) を各ファイルが写しとして持っている。
写しは ``CLAUDE.md`` だけ更新されてずれやすいので、``CLAUDE.md`` を正として
各ファイルの同節 (見出し行から次の ``## `` 見出しの直前まで) が一致するかを検査する。

- ``.github/copilot-instructions.md`` は ``.github/`` 配下にあるため、
  ``AGENTS.md`` へのリンクを ``../AGENTS.md`` と書く。``CLAUDE.md`` の同節のリンクをこの表記に
  置き換えたものを期待値として比較するので、リンクの書き換え忘れも検出できる
- 他の節は、ファイルごとに言語や粒度が違い完全一致を求めると誤検知になるため検査しない

なお本スクリプトは検証のみを行い、写しの自動書き換えは行わない。
差分が出た場合は ``CLAUDE.md`` の同節を各ファイルへ手動で写すこと。
"""

from __future__ import annotations

import argparse
import difflib
import re
import sys
from pathlib import Path

SOURCE_PATH = Path("CLAUDE.md")
COPY_PATHS = (
    Path(".cursorrules"),
    Path(".windsurfrules"),
    Path(".clinerules"),
    Path(".github/copilot-instructions.md"),
)

HEADING_RE = re.compile(r"^## 最重要原則")
NEXT_HEADING_RE = re.compile(r"^## ")

# 写しごとの、期待値を作るためのリンク表記の置き換え (CLAUDE.md での表記 -> 写しでの表記)
LINK_REPLACEMENTS = {
    Path(".github/copilot-instructions.md"): (("](AGENTS.md)", "](../AGENTS.md)"),),
}


class CheckError(Exception):
    """検証そのものが実施できない状態を表す。"""


def extract_section(text: str) -> list[str]:
    """「## 最重要原則」の見出し行から、次の ``## `` 見出しの直前までの行を返す。"""
    lines = text.splitlines()
    start = next((i for i, line in enumerate(lines) if HEADING_RE.match(line)), None)
    if start is None:
        raise CheckError("「## 最重要原則」見出しが見つかりません")

    end = next(
        (i for i in range(start + 1, len(lines)) if NEXT_HEADING_RE.match(lines[i])),
        len(lines),
    )
    return lines[start:end]


def expected_section(path: Path, source: list[str]) -> list[str]:
    """CLAUDE.md の同節から、写し path が持つべき節を作る。"""
    replacements = LINK_REPLACEMENTS.get(path, ())
    expected = []
    for line in source:
        for old, new in replacements:
            line = line.replace(old, new)
        expected.append(line)
    return expected


def diff_sections(expected: list[str], copy: list[str], copy_path: Path) -> list[str]:
    """節の差分を unified diff 形式で返す (一致していれば空リスト)。"""
    return list(
        difflib.unified_diff(
            expected,
            copy,
            fromfile=str(SOURCE_PATH),
            tofile=str(copy_path),
            lineterm="",
        )
    )


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise CheckError(f"{path} を読み込めません: {exc}") from exc


def read_section(root: Path, path: Path) -> list[str]:
    try:
        return extract_section(read_text(root / path))
    except CheckError as exc:
        raise CheckError(f"{path}: {exc}") from exc


def check(root: Path) -> list[str]:
    """問題点のメッセージを返す (問題がなければ空リスト)。"""
    source = read_section(root, SOURCE_PATH)
    problems: list[str] = []
    for path in COPY_PATHS:
        diff = diff_sections(expected_section(path, source), read_section(root, path), path)
        if diff:
            problems.append(f"{path} の「最重要原則」節が {SOURCE_PATH} と一致しません:\n" + "\n".join(diff))
    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("filenames", nargs="*", help="pre-commit から渡されるファイル名（未使用）")
    parser.parse_args(argv)

    root = Path(__file__).resolve().parent.parent
    try:
        problems = check(root)
    except CheckError as exc:
        print(f"「最重要原則」節の同期の検証を実施できませんでした: {exc}", file=sys.stderr)
        return 2

    if problems:
        print("AI エージェント向け指示ファイルの「最重要原則」節に差分があります:", file=sys.stderr)
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        print(
            f"\n{SOURCE_PATH} の同節を正として、各ファイルの同節へ写してください"
            "（.github/copilot-instructions.md のみ AGENTS.md へのリンクを ../AGENTS.md とする）。",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
