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
   npm install
   ```

6. **Make your changes** and ensure everything works locally by running the development server (`npm run dev`).
7. **Write tests** for your changes if applicable.
8. **Run tests and linting** to ensure your code meets our quality standards:

   ```bash
   npm run lint
   npm test
   ```

9. **Commit your changes**. Please write clear and concise commit messages.
10. **Push your branch** to your fork on GitHub:

    ```bash
    git push origin your-branch-name
    ```

11. **Submit a Pull Request**. Go to the original repository and click "New pull request". Fill out the provided Pull Request template to explain your changes.

## Development Setup

To set up the project locally for development:

1. Ensure you have Node.js (`>=18.18.0`) and npm (`>=9.0.0`) installed.
2. Ensure you have Python (`>=3.8`) and pip installed for pre-commit hooks.
3. Clone the repository and run `npm install`.
4. Set up pre-commit (requires Python) to ensure secrets are not committed:

   ```bash
   pip install pre-commit
   pre-commit install
   ```

5. Use `npm run dev` to start the local development server at `http://localhost:8080`.
6. Check for style issues with `npm run lint`.
7. Execute unit tests using `npm run unit`.
8. Perform end-to-end testing with `npm run e2e`.

## セキュリティおよび漏洩防止 (Security and Leak Prevention)

この公開リポジトリの安全性を確保するため、シークレット、認証情報、個人情報 (PII: DBダンプなど) の意図しない漏洩を防ぐ厳格なセキュリティ対策を実施しています。

- **シークレットをコミットしないでください**: APIキー、パスワード、クラウドアカウントの認証情報などをハードコードしてはいけません。
- **個人情報(PII)や大容量データをコミットしないでください**: テストデータ、データベースダンプ (`*.db`, `*.dump` など)、およびユーザー情報は絶対にコミットしてはいけません。
- **コミット前検知 (Pre-commit checks)**: ローカルで `gitleaks` や `detect-secrets` などのツールを使用して、シークレットがステージングされるのを防ぎます。CIパイプラインでは、すべてのPRで多層的なチェック (CodeQL, Trivy, TruffleHog など) を実行します。
- ピアレビューとCIの検証を強制するため、`main` または `master` ブランチへの直接コミットは pre-commit フックによってブロックされます。

当リポジトリの多層防御と開発者の責任についての詳細は、[SECURITY.md](SECURITY.md) を確認してください。

## Code Style

This project follows standard Vue.js and JavaScript conventions, enforced by ESLint. Please make sure to run `npm run lint` before submitting a pull request to ensure your code complies with our styling rules.

Thank you for your contributions!
