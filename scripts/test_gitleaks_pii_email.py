#!/usr/bin/env python3
"""``.gitleaks.toml`` の ``pii-email`` カスタムルールの挙動を固定する回帰テスト。

``gitleaks stdin`` に検証対象の文字列を流し込み、検知・非検知が期待どおりかを確認する。
正規表現を Python で再実装するのではなく gitleaks 本体を実行するのは、検証したいのが
「本リポジトリの設定を gitleaks が解釈した結果」そのものだからである。

テスト対象の文字列は、ローカル部とドメイン部を別々の文字列として保持し、実行時に ``@`` で
連結して組み立てる。こうすることで、このファイル自身のどこにも完全なメールアドレスの
リテラルが現れない。gitleaks はもちろん、trufflehog / detect-secrets / secretlint、および
``ai-context`` ブランチに取り込まれる Repomix のスナップショット（``--log-opts="--all"`` で
全ブランチが走査される）からも誤検知されないようにするための措置である。

gitleaks のバージョンは ``.pre-commit-config.yaml`` の ``# frozen: vX.Y.Z`` を単一ソースとし、
CI ではそのバージョンのバイナリを導入したうえで本テストを実行する
（``.github/workflows/pre-commit.yml`` を参照）。
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess  # nosec B404
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
GITLEAKS_CONFIG_PATH = REPO_ROOT / ".gitleaks.toml"
PRE_COMMIT_CONFIG_PATH = REPO_ROOT / ".pre-commit-config.yaml"

RULE_ID = "pii-email"

# .pre-commit-config.yaml の gitleaks エントリから `# frozen: vX.Y.Z` を取り出す。
# rev は SHA 固定のため、タグ名はこのコメントにしか存在しない。
FROZEN_VERSION_PATTERN = re.compile(
    r"-\s*repo:\s*https://github\.com/gitleaks/gitleaks\s*\n"
    r"\s*rev:\s*\S+\s*#\s*frozen:\s*v?(?P<version>[0-9][0-9A-Za-z.+-]*)",
)


class GitleaksUnavailableError(RuntimeError):
    """gitleaks バイナリを利用できない。"""


def frozen_gitleaks_version() -> str:
    """``.pre-commit-config.yaml`` で固定している gitleaks のバージョンを返す。

    CI のインストールステップからも呼び出すため、公開関数として切り出している。
    """
    text = PRE_COMMIT_CONFIG_PATH.read_text(encoding="utf-8")
    match = FROZEN_VERSION_PATTERN.search(text)
    if match is None:
        raise GitleaksUnavailableError(
            f"{PRE_COMMIT_CONFIG_PATH.name} の gitleaks エントリから "
            "`# frozen: vX.Y.Z` を読み取れませんでした"
        )
    return match.group("version")


def address(local_part: str, domain_part: str) -> str:
    """ローカル部とドメイン部からメールアドレスを組み立てる。

    リポジトリ内に完全なメールアドレスのリテラルを残さないため、必ずこの関数を経由する。
    """
    return f"{local_part}@{domain_part}"


def installed_gitleaks_version(gitleaks: str) -> str:
    completed = subprocess.run(  # nosec B603
        [gitleaks, "version"],
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        raise GitleaksUnavailableError(f"`gitleaks version` が失敗しました: {completed.stderr}")
    return completed.stdout.strip()


def scan(gitleaks: str, text: str) -> list[dict]:
    """``gitleaks stdin`` で 1 行を走査し、検出結果の一覧を返す。"""
    completed = subprocess.run(  # nosec B603
        [
            gitleaks,
            "stdin",
            "--config",
            str(GITLEAKS_CONFIG_PATH),
            "--no-banner",
            "--log-level",
            "error",
            "--report-format",
            "json",
            "--report-path",
            "-",
            # 検出の有無は終了コードではなくレポート内容で判定するため、
            # 検出時も 0 で終了させ、0 以外は gitleaks 自身の異常とみなす。
            "--exit-code",
            "0",
        ],
        input=f"{text}\n",
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        raise GitleaksUnavailableError(
            f"gitleaks の実行に失敗しました (exit={completed.returncode}): {completed.stderr}"
        )
    return json.loads(completed.stdout or "[]")


def pii_email_findings(gitleaks: str, text: str) -> list[dict]:
    return [finding for finding in scan(gitleaks, text) if finding.get("RuleID") == RULE_ID]


class GitleaksTestCase(unittest.TestCase):
    """gitleaks バイナリを用いるテストの共通基底。"""

    gitleaks: str

    @classmethod
    def setUpClass(cls) -> None:
        gitleaks = shutil.which("gitleaks")
        if gitleaks is None:
            message = (
                "gitleaks バイナリが PATH にありません。"
                "`brew install gitleaks` 等で導入するか、CI と同じバージョン "
                f"(v{frozen_gitleaks_version()}) を入れてください。"
            )
            if os.environ.get("CI"):
                # CI では導入ステップが失敗している可能性があるため、
                # 黙ってスキップして検証が素通りすることを防ぐ。
                raise AssertionError(message)
            raise unittest.SkipTest(message)
        cls.gitleaks = gitleaks

    def assertDetected(self, value: str, expected_secret: str) -> None:
        findings = pii_email_findings(self.gitleaks, value)
        self.assertEqual(
            [finding["Secret"] for finding in findings],
            [expected_secret],
            f"`{value}` は {RULE_ID} で検知されるべきです",
        )

    def assertNotDetected(self, value: str) -> None:
        findings = pii_email_findings(self.gitleaks, value)
        self.assertEqual(
            [finding["Secret"] for finding in findings],
            [],
            f"`{value}` は {RULE_ID} で検知されるべきではありません",
        )


class DetectionTest(GitleaksTestCase):
    """検知されるべき値。"""

    def test_一般的なメールアドレスを検知する(self):
        value = address("alice", "example.org")
        self.assertDetected(value, value)

    def test_許可リストにないローカル部のアドレスを検知する(self):
        # 許可リストの `example.com` 系は dummy / test のみで、ドメイン全体は除外していない。
        value = address("alice", "example.com")
        self.assertDetected(value, value)

    def test_許可リストのアドレスを部分文字列に含むアドレスを検知する(self):
        # 許可リストは `^...$` でアンカーされているため、前後に文字が付けば別アドレスとして検知される。
        for local_part, domain_part in (
            ("foo.genzouw", "gmail.com"),
            ("genzouw", "gmail.com.evil.com"),
        ):
            with self.subTest(local_part=local_part, domain_part=domain_part):
                value = address(local_part, domain_part)
                self.assertDetected(value, value)

    def test_数値ラベルを含むドメインでも英字ラベルがあれば検知する(self):
        # `123.456` 自体に英字はないが、TLD 直前の `co` が英字条件を満たす。
        value = address("alice", "123.456.co.uk")
        self.assertDetected(value, value)

    def test_punycode_ドメインを検知する(self):
        # Punycode は ASCII のため検知される。ただし `--` 以降は文字クラスに含まれず、
        # 切り出される文字列は TLD の途中までとなる。
        self.assertDetected(
            address("alice", "xn--r8jz45g.xn--zckzah"),
            address("alice", "xn--r8jz45g.xn"),
        )


class AllowlistTest(GitleaksTestCase):
    """``[[rules.allowlists]]`` で除外されるべき値。"""

    def test_許可リストのアドレスを検知しない(self):
        for local_part, domain_part in (
            # メンテナが README / SECURITY / package.json で公開している連絡先
            ("genzouw", "gmail.com"),
            # ダミーデータ
            ("dummy", "example.com"),
            ("test", "example.com"),
            # CI Bot のコミッターアドレス
            ("github-actions[bot]", "users.noreply.github.com"),
            ("dependabot[bot]", "users.noreply.github.com"),
            # .gitleaks.toml 自身のコメント中に例示として現れるダミーアドレス
            ("xgenzouw", "gmail.com"),
            ("alice+genzouw", "gmail.com"),
        ):
            with self.subTest(local_part=local_part, domain_part=domain_part):
                self.assertNotDetected(address(local_part, domain_part))

    def test_許可リストは大文字小文字を区別しない(self):
        self.assertNotDetected(address("GENZOUW", "GMAIL.COM"))


class SpecificationBoundaryTest(GitleaksTestCase):
    """仕様として検知しないと決めている値。

    ここで固定している挙動は ``docs/security/leak-prevention.md`` の
    「pii-email ルールの検知範囲」と対応している。
    """

    def test_数値のみのドメインを検知しない(self):
        # Bun のパッチファイル名（例: node@29.2.6.patch）を誤検知しないよう、
        # ドメイン部に英字を 1 文字以上要求している。その帰結として数値のみの
        # ドメインを持つアドレスも検知されない。
        for local_part, domain_part in (
            ("node", "29.2.6.patch"),
            ("alice", "123.456.com"),
        ):
            with self.subTest(local_part=local_part, domain_part=domain_part):
                self.assertNotDetected(address(local_part, domain_part))

    def test_bun_のパッチファイルパスを検知しない(self):
        self.assertNotDetected("patches/@vue%2Fvue3-jest@29.2.6.patch")

    def test_非_ascii_ドメインを検知しない(self):
        # 正規表現が ASCII の文字クラスのみで構成されているため。
        self.assertNotDetected(address("alice", "例え.テスト"))

    def test_tld_が_1_文字のアドレスを検知しない(self):
        # TLD は `[A-Za-z]{2,}` を要求している。
        self.assertNotDetected(address("alice", "example.c"))


class FrozenVersionTest(unittest.TestCase):
    """``.pre-commit-config.yaml`` の固定バージョンとの整合。"""

    def test_frozen_バージョンを読み取れる(self):
        self.assertRegex(frozen_gitleaks_version(), r"^\d+\.\d+\.\d+")

    @unittest.skipUnless(
        os.environ.get("CI"),
        "ローカルの gitleaks はバージョンが異なりうるため CI でのみ検証する",
    )
    def test_ci_の_gitleaks_は固定バージョンと一致する(self):
        gitleaks = shutil.which("gitleaks")
        self.assertIsNotNone(gitleaks, "CI に gitleaks バイナリが導入されていません")
        self.assertEqual(installed_gitleaks_version(gitleaks), frozen_gitleaks_version())


if __name__ == "__main__":
    unittest.main()
