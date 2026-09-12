#!/usr/bin/env python3
"""check_protected_patterns.py のユニットテスト。

実行方法: ``python3 -m unittest discover -s scripts -p 'test_*.py'``
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from check_protected_patterns import (  # noqa: E402
    CheckError,
    SensitiveFilesHook,
    VscodeExcludes,
    allowlist_entries,
    compile_vscode_glob,
    expand,
    extract_hook_regexes,
    samples_for,
)


class SamplesForTest(unittest.TestCase):
    def test_ext_はルートとネストの両方を生成する(self):
        self.assertEqual(
            samples_for({"kind": "ext", "value": "pem"}),
            ["sample.pem", "nested/dir/sample.pem"],
        )

    def test_dir_は配下のファイルを生成する(self):
        self.assertEqual(
            samples_for({"kind": "dir", "value": ".aws"}),
            [".aws/sample.txt", "nested/dir/.aws/sample.txt"],
        )

    def test_file_はパスをそのまま使う(self):
        self.assertEqual(
            samples_for({"kind": "file", "value": ".vscode/launch.json"}),
            [".vscode/launch.json", "nested/dir/.vscode/launch.json"],
        )

    def test_samples_が明示されていればそれを優先する(self):
        self.assertEqual(
            samples_for({"kind": "ext", "value": "pem", "samples": ["custom.pem"]}),
            ["custom.pem"],
        )

    def test_glob_は_samples_無しではエラーになる(self):
        with self.assertRaises(CheckError):
            samples_for({"kind": "glob", "value": "id_rsa*"})

    def test_未知の_kind_はエラーになる(self):
        with self.assertRaises(CheckError):
            samples_for({"kind": "regex", "value": "x"})


class ExpandTest(unittest.TestCase):
    def test_layers_省略時は全層が対象になる(self):
        expanded = expand(
            {"categories": [{"name": "c", "patterns": [{"kind": "ext", "value": "pem"}]}]}
        )
        self.assertEqual(
            expanded[0]["layers"],
            ["gitignore", "gitattributes", "vscode-files", "vscode-search", "precommit"],
        )

    def test_未知の層はエラーになる(self):
        with self.assertRaises(CheckError):
            expand(
                {
                    "categories": [
                        {
                            "name": "c",
                            "patterns": [{"kind": "ext", "value": "pem", "layers": ["editorconfig"]}],
                        }
                    ]
                }
            )

    def test_allowlist_の未知の層もエラーになる(self):
        with self.assertRaises(CheckError):
            allowlist_entries({"allowlist": [{"path": "a.txt", "layers": ["editorconfig"]}]})


class CompileVscodeGlobTest(unittest.TestCase):
    def test_先頭の二重アスタリスクは任意階層にマッチする(self):
        regex = compile_vscode_glob("**/*.pem")
        self.assertTrue(regex.fullmatch("a.pem"))
        self.assertTrue(regex.fullmatch("nested/dir/a.pem"))

    def test_単一アスタリスクはスラッシュを跨がない(self):
        regex = compile_vscode_glob("*.pem")
        self.assertTrue(regex.fullmatch("a.pem"))
        self.assertIsNone(regex.fullmatch("nested/a.pem"))

    def test_文字クラスを保持する(self):
        regex = compile_vscode_glob("**/*.sw[a-p]")
        self.assertTrue(regex.fullmatch("a.swp"))
        self.assertIsNone(regex.fullmatch("a.swz"))

    def test_ドットはリテラルとして扱う(self):
        regex = compile_vscode_glob("**/.env*")
        self.assertTrue(regex.fullmatch(".env.local"))
        self.assertIsNone(regex.fullmatch("xenv"))


class VscodeExcludesTest(unittest.TestCase):
    def setUp(self) -> None:
        self.excludes = VscodeExcludes(
            {
                "files.exclude": {"**/.aws": True, "**/.env*": True, "**/.env.example": False},
                "search.exclude": {"**/*.log": True},
            }
        )

    def test_ディレクトリのパターンは配下のファイルも除外する(self):
        self.assertTrue(self.excludes.excluded("vscode-files", ".aws/credentials"))
        self.assertTrue(self.excludes.excluded("vscode-files", "nested/.aws/config"))

    def test_値が_false_のエントリは他のパターンによる除外を打ち消さない(self):
        # VS Code の実挙動に合わせ、false は単にそのパターンを無効化するだけとみなす
        self.assertTrue(self.excludes.excluded("vscode-files", ".env.example"))

    def test_セクションごとに独立して判定する(self):
        self.assertTrue(self.excludes.excluded("vscode-search", "a.log"))
        self.assertFalse(self.excludes.excluded("vscode-files", "a.log"))

    def test_セクションが欠けていればエラーになる(self):
        with self.assertRaises(CheckError):
            VscodeExcludes({"files.exclude": {}})


CONFIG_SAMPLE = """repos:
  - repo: local
    hooks:
      - id: other-hook
        entry: 'noop'
        files: '^never-match$'
      - id: forbid-sensitive-files
        name: forbid sensitive files
        language: fail
        files: >-
          (?ix)(
            \\.pem$ |
            \\.env[^/]*
          )
        exclude: >-
          (?ix)(
            (^|/)\\.env\\.example$
          )
        description: 'sample'
      - id: trailing-hook
        entry: 'noop'
"""


class ExtractHookRegexesTest(unittest.TestCase):
    def test_対象フックのブロックスカラーだけを取り出す(self):
        files, exclude = extract_hook_regexes(CONFIG_SAMPLE, "forbid-sensitive-files")
        self.assertIn("\\.pem$", files)
        self.assertNotIn("never-match", files)
        self.assertIn("env\\.example", exclude)

    def test_フックが無ければエラーになる(self):
        with self.assertRaises(CheckError):
            extract_hook_regexes(CONFIG_SAMPLE, "missing-hook")

    def test_インラインの値も読み取れる(self):
        files, exclude = extract_hook_regexes(CONFIG_SAMPLE, "other-hook")
        self.assertEqual(files, "^never-match$")
        self.assertIsNone(exclude)


class SensitiveFilesHookTest(unittest.TestCase):
    def setUp(self) -> None:
        self.hook = SensitiveFilesHook(*extract_hook_regexes(CONFIG_SAMPLE, "forbid-sensitive-files"))

    def test_files_にマッチすればブロックする(self):
        self.assertTrue(self.hook.blocks("secret.pem"))
        self.assertTrue(self.hook.blocks("nested/dir/.env.local"))

    def test_exclude_にマッチすればブロックしない(self):
        self.assertFalse(self.hook.blocks(".env.example"))

    def test_どちらにもマッチしなければブロックしない(self):
        self.assertFalse(self.hook.blocks("src/main.js"))

    def test_verbose_フラグが無ければエラーになる(self):
        # 行を改行で連結して復元しているため、(?x) が外れると判定が壊れる
        with self.assertRaises(CheckError):
            SensitiveFilesHook("(?i)(\n  \\.pem$\n)", None)

    def test_不正な正規表現はエラーになる(self):
        with self.assertRaises(CheckError):
            SensitiveFilesHook("(?ix)(\n  [unclosed\n", None)


if __name__ == "__main__":
    unittest.main()
