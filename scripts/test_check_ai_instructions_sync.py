#!/usr/bin/env python3
"""check_ai_instructions_sync.py のユニットテスト。

実行方法: ``python3 -m unittest discover -s scripts -p 'test_*.py'``
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from check_ai_instructions_sync import (  # noqa: E402
    COPY_PATHS,
    LINK_REPLACEMENTS,
    SOURCE_PATH,
    CheckError,
    check,
    extract_section,
)

SECTION = (
    "## 最重要原則: 完全無料の SaaS・AI・ツールのみを利用する (MUST)\n"
    "\n"
    "- **禁止**: 有料プランの導入。\n"
    "\n"
    "詳細は [`AGENTS.md`](AGENTS.md) を参照してください。\n"
    "\n"
)


def document(section: str, title: str = "# タイトル\n\n前置き。\n\n") -> str:
    return f"{title}{section}## Commands\n\n- `bun run unit`\n"


class ExtractSectionTest(unittest.TestCase):
    def test_次の見出しの直前までを抽出する(self):
        lines = extract_section(document(SECTION))
        self.assertEqual(lines[0], "## 最重要原則: 完全無料の SaaS・AI・ツールのみを利用する (MUST)")
        self.assertNotIn("## Commands", lines)

    def test_最後の節ならファイル末尾までを抽出する(self):
        self.assertEqual(extract_section("# タイトル\n\n" + SECTION), SECTION.splitlines())

    def test_見出しがなければエラー(self):
        with self.assertRaises(CheckError):
            extract_section("# タイトル\n\n## Commands\n")


class CheckTest(unittest.TestCase):
    def write_repo(self, root: Path, overrides: dict[Path, str] | None = None) -> None:
        overrides = overrides or {}
        (root / SOURCE_PATH).write_text(document(SECTION), encoding="utf-8")
        for path in COPY_PATHS:
            section = SECTION
            for old, new in LINK_REPLACEMENTS.get(path, ()):
                section = section.replace(old, new)
            text = overrides.get(path, document(section, title=f"# {path}\n\n"))
            (root / path).parent.mkdir(parents=True, exist_ok=True)
            (root / path).write_text(text, encoding="utf-8")

    def test_すべて一致していれば問題なし(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_repo(root)
            self.assertEqual(check(root), [])

    def test_写しの行の欠落を差分として報告する(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            stale = SECTION.replace("- **禁止**: 有料プランの導入。\n", "")
            self.write_repo(root, {Path(".cursorrules"): document(stale)})
            problems = check(root)
            self.assertEqual(len(problems), 1)
            self.assertIn(".cursorrules", problems[0])
            self.assertIn("-- **禁止**: 有料プランの導入。", problems[0])

    def test_copilot_instructions_のリンクを書き換えずに写すと差分になる(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_repo(root, {Path(".github/copilot-instructions.md"): document(SECTION)})
            problems = check(root)
            self.assertEqual(len(problems), 1)
            self.assertIn("+詳細は [`AGENTS.md`](AGENTS.md) を参照してください。", problems[0])

    def test_cursor_rules_のリンクを書き換えずに写すと差分になる(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_repo(root, {Path(".cursor/rules/general.mdc"): document(SECTION)})
            problems = check(root)
            self.assertEqual(len(problems), 1)
            self.assertIn(".cursor/rules/general.mdc", problems[0])
            self.assertIn("+詳細は [`AGENTS.md`](AGENTS.md) を参照してください。", problems[0])

    def test_サブディレクトリ以外の写しで親ディレクトリのリンクを使うと差分になる(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            moved = SECTION.replace("](AGENTS.md)", "](../AGENTS.md)")
            self.write_repo(root, {Path(".clinerules"): document(moved)})
            problems = check(root)
            self.assertEqual(len(problems), 1)
            self.assertIn(".clinerules", problems[0])

    def test_写しに見出しがなければエラー(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_repo(root, {Path(".windsurfrules"): "# タイトル\n\n## Commands\n"})
            with self.assertRaisesRegex(CheckError, r"\.windsurfrules"):
                check(root)

    def test_写しのファイルがなければエラー(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_repo(root)
            (root / ".clinerules").unlink()
            with self.assertRaises(CheckError):
                check(root)


if __name__ == "__main__":
    unittest.main()
