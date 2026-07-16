# Hyakunin Isshu

![Build Status](https://github.com/genzouw/hyakuninissyu/workflows/Deploy/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A modern Vue.js application for exploring and learning the **Hyakunin Isshu** (One Hundred Poets, One Poem Each).

This project provides an interactive and user-friendly interface to browse, read, and understand the classic Japanese anthology of 100 waka poems.

## Features

- **Interactive UI**: Built with Vue.js for a seamless and responsive experience.
- **Poem Exploration**: Browse through the 100 poems with ease.
- **Detailed Information**: View the author, original text, and modern translation for each poem.
- **Modern Stack**: Developed using Vue.js, Vuex, Vue Router, and Webpack.

## Prerequisites

Ensure you have the following installed on your local machine:

- **Bun**: `>=1.0.0`（Node.js/npm の代替）

## Installation & Setup

To get a local copy up and running, follow these simple steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/genzouw/hyakuninissyu.git
   cd hyakuninissyu
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Run the development server:**

   ```bash
   # serve with hot reload at localhost:8080
   bun run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8080` to view the application.

## Available Scripts

In the project directory, you can run:

- `bun run dev` - ホットリロード付きの開発サーバーを起動します。
- `bun run build` - `dist` フォルダにミニファイ済みの本番用ビルドを生成します。
- `bun run unit` - Jest を使用したユニットテストを実行します。
- `bun run lint` - ESLint でコードベースをリンティングします。

## CI/CD および自動コードレビュー

本プロジェクトでは、コードの品質と安定性を維持するために、複数の自動化ツールを活用しています。

- **ESLint & Jest**: GitHub Actions を介した自動リンティングとユニットテスト。
- **Lighthouse CI**: 全てのプルリクエストに対して、パフォーマンス、アクセシビリティ、ベストプラクティス、SEO のスコアを計測します。
- **AI Code Review**: 高度な静的解析と AI モデル（Gemini 2.5 Pro）を組み合わせた自動コードレビューツールです。`.github/workflows/ai-code-review.yml` で設定されています。PR 上での自動レビューや、`/review` コメントによる手動トリガーが可能です。無料で利用できる Gemini の API を活用しています。
  - **事前準備（手動設定）**: 本ツールを利用するためには、[Google AI Studio](https://aistudio.google.com/) にて無料で API キーを発行し、GitHub リポジトリの Secrets に `GOOGLE_API_KEY` として登録する必要があります。
- **PR Agent (Qodo)**: AI を活用した自動コードレビューツールです。本リポジトリでは `.pr_agent.toml` で設定を管理しています。
  - **事前準備（手動設定）**: PR Agent（Qodo）を利用するためには、GitHub の公開リポジトリで無料で使える「Qodo GitHub App」を該当の GitHub アカウントまたは Organization にインストールする必要があります。
- **IndexNow**: SEO および検索エンジンへのインデックス登録を高速化するためのアクションです。`.github/workflows/deploy.yml` 内に設定されています。
  - **事前準備（手動設定）**: IndexNow を利用するためには、API キーを生成してリポジトリの Secrets に `INDEXNOW_KEY` として登録する必要があります。
- **CodeRabbit**: `.coderabbit.yaml` で設定されている、もうひとつの AI コードレビューアシスタントです。
- **Zizmor**: GitHub Actions ワークフローのセキュリティ脆弱性を静的解析するツールです。`.github/workflows/zizmor.yml` にて GitHub Actions ワークフローとして設定されており、生成された SARIF レポートは GitHub Code Scanning にアップロードされます。公開リポジトリでは無料で利用可能です。
- **Repomix**: リポジトリ全体のソースコードを AI が読みやすい単一ファイル（XML 形式）にパッケージングするツールです。`.github/workflows/repomix.yml` にて GitHub Actions として設定されており、生成されたファイル（`repomix-output.xml`）は Artifacts としてダウンロードでき、LLM のコンテキストとしてそのまま活用できます。

## Deployment

This application is configured for deployment to AWS S3 and CloudFront as static content. The deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`).

## Contributing

We welcome contributions from the community! Whether it's a bug report, a new feature suggestion, or a pull request, your help is appreciated.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Author

- **genzouw** - [genzouw@gmail.com](mailto:genzouw@gmail.com)

## セキュリティ報告窓口と漏洩防止 (Security Reporting and Leak Prevention)

本リポジトリは公開リポジトリとして運用されるため、認証情報やシークレットの混入を厳格に防止しています。ローカルの `pre-commit` フックに加え、CI では GitHub Secret Scanning や Push Protection を含む多層的な防御を行っています。

脆弱性を発見した場合や、漏洩の兆候を発見した場合は、Issue や Pull Request で公開せず、GitHub Private Vulnerability Reporting を通じて安全にご報告ください。詳細は [SECURITY.md](SECURITY.md) および [漏洩防止と多層防御の仕組み](docs/security/leak-prevention.md) を確認してください。
