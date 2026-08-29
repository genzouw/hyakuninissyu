# Contributing to Hyakunin Isshu

First off, thank you for considering contributing to Hyakunin Isshu! It's people like you that make open-source projects such a great community.

We welcome contributions of all kinds, including bug reports, feature requests, documentation improvements, and code changes.

## How Can I Contribute?

### Reporting Bugs

If you find a bug in the application, please help us by reporting it! Before creating a new bug report, please check the [existing issues](https://github.com/genzouw/hyakuninissyu/issues) to see if it has already been reported.

When creating a new bug report, please include:

- A clear and descriptive title.
- A detailed description of the problem.
- Steps to reproduce the bug.
- The expected behavior vs. the actual behavior.
- Screenshots or error logs if applicable.
- Your environment details (OS, browser, Node.js version, etc.).

### Suggesting Enhancements

We are always looking for ways to improve! If you have an idea for a new feature or an enhancement to an existing one, please submit an issue.

When suggesting an enhancement, please include:

- A clear and descriptive title.
- A detailed description of the proposed feature and its use case.
- Any relevant mockups or examples.

### Pull Requests

We love pull requests! If you're ready to contribute code or documentation, please follow these steps:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/hyakuninissyu.git
   cd hyakuninissyu
   ```

3. **Add the upstream remote**:

   ```bash
   git remote add upstream https://github.com/genzouw/hyakuninissyu.git
   ```

4. **Create a new branch** for your feature or bugfix. Use a descriptive name:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

5. **Install dependencies**:

   ```bash
   bun install
   ```

6. **Make your changes** and ensure everything works locally by running the development server (`bun run dev`).
7. **Write tests** for your changes if applicable.
8. **Run tests and linting** to ensure your code meets our quality standards:

   ```bash
   bun run lint
   bun run unit
   ```

9. **Commit your changes**. Please write clear and concise commit messages.
10. **Push your branch** to your fork on GitHub:

    ```bash
    git push origin your-branch-name
    ```

11. **Submit a Pull Request**. Go to the original repository and click "New pull request". Fill out the provided Pull Request template to explain your changes.

## Development Setup

To set up the project locally for development:

1. Ensure you have Bun (`>=1.0.0`) and Node.js (`>=22.0.0`) installed.
2. Ensure you have Python (`>=3.8`) and pip installed for pre-commit hooks.
3. Clone the repository and run `bun install`.
4. Set up pre-commit (requires Python) to ensure secrets are not committed:

   ```bash
   pip install -r requirements.txt
   pre-commit install
   ```

5. Use `bun run dev` to start the local development server at `http://localhost:8080`.
6. Check for style issues with `bun run lint`.
7. Execute unit tests using `bun run unit`.
8. Perform end-to-end testing with `bun run e2e`.

## セキュリティおよび漏洩防止 (Security and Leak Prevention)

この公開リポジトリの安全性を確保するため、シークレット、認証情報、個人情報 (PII: DB ダンプなど) の意図しない漏洩を防ぐ厳格なセキュリティ対策を実施しています。

- **シークレットをコミットしないでください**: API キー、パスワード、クラウドアカウントの認証情報などをハードコードしてはいけません。
- **個人情報(PII)や大容量データをコミットしないでください**: テストデータ、データベースダンプ (`*.db`, `*.dump` など)、およびユーザー情報は絶対にコミットしてはいけません。
- **コミット前検知 (Pre-commit checks)**: ローカルで `gitleaks` や `detect-secrets` などのツールを使用して、シークレットがステージングされるのを防ぎます。CI パイプラインでは、すべての PR で多層的なチェック (CodeQL, Trivy, TruffleHog など) を実行します。
- ピアレビューと CI の検証を強制するため、`main` または `master` ブランチへの直接コミットは pre-commit フックによってブロックされます。

当リポジトリの多層防御と開発者の責任についての詳細は、[SECURITY.md](SECURITY.md) を確認してください。

## Code Style

This project follows standard Vue.js and JavaScript conventions, enforced by ESLint. Please make sure to run `bun run lint` before submitting a pull request to ensure your code complies with our styling rules.

Thank you for your contributions!

## 追加の注意事項: GitHub Secret Scanning と Push Protection

本リポジトリでは GitHub ネイティブの **Push Protection** などの機能によって、シークレットを含むコミットのプッシュがサーバー側で直接拒否される場合があります。エラーメッセージが表示された場合は、必ずガイドラインに従い、シークレットをコミット履歴から取り除いてから再度プッシュしてください。

開発者・メンテナは、意図しない認証情報やシークレットの流出をサーバーサイドで未然に防ぐため、必ずリポジトリの `Settings` → `Security` → `Code security and analysis` から **Secret scanning** と **Push protection** が有効 (Enable) になっていることを定期的に確認してください。

また、CI 上の TruffleHog および Gitleaks は、**現在有効なシークレットだけでなく、無効化済み・ローテート済みのシークレットパターンもすべて検知してブロックするよう厳格に設定**されています。ダミー値を使用する場合でも、実際のシークレットと見なされる高エントロピーな文字列は避けてください。

## コスト方針 (Cost Policy) — 最重要

本プロジェクトは公開 OSS であり、**CI/CD および自動化ワークフローに組み込んでよいのは、公開 OSS リポジトリで完全無料 (課金が一切発生しない) な SaaS / AI / ツールのみ** です。

- LLM プロバイダの API キー (`GEMINI_API_KEY` / `GOOGLE_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` 等) や従量課金の検索 API キー (`TAVILY_API_KEY` / `EXA_API_KEY` 等) を GitHub Secrets に登録し、CI から呼び出す構成の追加は **禁止** です。
- 「無料枠に収まる前提」での従量課金 API 利用も禁止です。レート制限超過で課金が始まる構造そのものを禁止しています。
- 有料プラン / 有料トライアル / クレジットカード登録を必要とするサービスの導入も禁止です。
- 開発者個人のローカル環境で、自分の負担で AI ツールを使うことは問題ありません。禁止しているのは CI/CD への組み込みです。

このポリシーに反する Pull Request は、内容の良し悪しにかかわらずクローズされます。例外を検討したい場合は PR ではなく Issue で提案してください。
完全な規範は [AGENTS.md](AGENTS.md) を参照してください。
