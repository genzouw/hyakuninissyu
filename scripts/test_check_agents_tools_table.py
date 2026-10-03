#!/usr/bin/env python3
"""check_agents_tools_table.py のユニットテスト。

実行方法: ``python3 -m unittest discover -s scripts -p 'test_*.py'``
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from check_agents_tools_table import (  # noqa: E402
    COPY_PATH,
    SOURCE_PATH,
    CheckError,
    check,
    diff_tables,
    extract_table,
    referenced_paths,
)

HEADER = "| 種別 | ツール / 設定ファイル | 役割 |\n| :--- | :--- | :--- |\n"


def document(heading: str, rows: str, trailer: str = "\n## 次の章\n\n| a | b |\n| - | - |\n") -> str:
    return f"# タイトル\n\n{heading}\n\n説明文。\n\n{HEADER}{rows}{trailer}"


class ExtractTableTest(unittest.TestCase):
    def test_章番号付きの見出しから表を抽出する(self):
        rows = extract_table(document("## 2. 既に動いているツール (重複 PR を作らないこと)", "| Lint | ESLint | 検査 |\n"))
        self.assertEqual(rows, [["Lint", "ESLint", "検査"]])

    def test_章番号なしの見出しから表を抽出する(self):
        rows = extract_table(document("### 既に動いているツール (重複 PR を作らないこと)", "| Lint | ESLint | 検査 |\n"))
        self.assertEqual(rows, [["Lint", "ESLint", "検査"]])

    def test_表の後ろにある別の表は含めない(self):
        rows = extract_table(document("## 既に動いているツール", "| A | B | C |\n| D | E | F |\n"))
        self.assertEqual(len(rows), 2)

    def test_見出しがなければエラー(self):
        with self.assertRaises(CheckError):
            extract_table("# タイトル\n\n| a | b |\n| - | - |\n")

    def test_見出しの直後に表がなければエラー(self):
        with self.assertRaises(CheckError):
            extract_table("## 既に動いているツール\n\n本文のみ。\n\n## 次の章\n\n| a | b |\n| - | - |\n")


class DiffTablesTest(unittest.TestCase):
    def test_役割列の差分は無視する(self):
        source = [["ポリシー検査", "free-policy", "§1 違反で失敗"]]
        copy = [["ポリシー検査", "free-policy", "制約違反で失敗"]]
        self.assertEqual(diff_tables(source, copy), [])

    def test_写しにだけある行を検知する(self):
        source = [["Lint", "ESLint", "検査"]]
        copy = [["Lint", "ESLint", "検査"], ["静的解析", "Codacy", "解析"]]
        self.assertIn("+静的解析 | Codacy", diff_tables(source, copy))

    def test_ツール列の差分を検知する(self):
        source = [["依存更新", "Renovate", "更新"]]
        copy = [["依存更新", "Dependabot", "更新"]]
        diff = diff_tables(source, copy)
        self.assertIn("-依存更新 | Renovate", diff)
        self.assertIn("+依存更新 | Dependabot", diff)

    def test_行の順序の差分を検知する(self):
        a = ["Lint", "ESLint", "検査"]
        b = ["Lint", "Prettier", "整形"]
        self.assertNotEqual(diff_tables([a, b], [b, a]), [])


class ReferencedPathsTest(unittest.TestCase):
    def test_ツール列のパスだけを抽出する(self):
        rows = [
            ["Lint", "ESLint (`eslint.config.mjs`), commitlint (`.husky/`)", "`allowed_secrets` に追記"],
            ["AI", "[CodeRabbit](https://github.com/apps/coderabbitai) (`.coderabbit.yaml`)", "レビュー"],
        ]
        self.assertEqual(referenced_paths(rows), ["eslint.config.mjs", ".husky/", ".coderabbit.yaml"])

    def test_パスとみなせないコードスパンは除外する(self):
        self.assertEqual(referenced_paths([["種別", "`bun` (`package.json`)", "役割"]]), ["package.json"])


class CheckTest(unittest.TestCase):
    def write_repo(self, root: Path, source_rows: str, copy_rows: str) -> None:
        (root / COPY_PATH).parent.mkdir(parents=True)
        (root / SOURCE_PATH).write_text(document("## 2. 既に動いているツール", source_rows), encoding="utf-8")
        (root / COPY_PATH).write_text(document("### 既に動いているツール", copy_rows), encoding="utf-8")

    def test_一致していてパスも実在すれば問題なし(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "eslint.config.mjs").touch()
            self.write_repo(root, "| Lint | ESLint (`eslint.config.mjs`) | 検査 |\n", "| Lint | ESLint (`eslint.config.mjs`) | 静的検査 |\n")
            self.assertEqual(check(root), [])

    def test_実在しないパスを両ファイルについて報告する(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            row = "| Lint | ESLint (`eslint.config.js`) | 検査 |\n"
            self.write_repo(root, row, row)
            problems = check(root)
            self.assertEqual(len(problems), 2)
            self.assertTrue(all("`eslint.config.js`" in p for p in problems))

    def test_片方のファイルがなければエラー(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / SOURCE_PATH).write_text(document("## 既に動いているツール", "| a | b | c |\n"), encoding="utf-8")
            with self.assertRaises(CheckError):
                check(root)


if __name__ == "__main__":
    unittest.main()
