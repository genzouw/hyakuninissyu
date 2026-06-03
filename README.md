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
- **PR Agent (Qodo)**: AI を活用した自動コードレビューツールです。本リポジトリでは `.pr_agent.toml` で設定を管理しています。
  - **事前準備（手動設定）**: PR Agent（Qodo）を利用するためには、GitHub の公開リポジトリで無料で使える「Qodo GitHub App」を該当のGitHubアカウントまたはOrganizationにインストールする必要があります。
- **CodeRabbit**: `.coderabbit.yaml` で設定されている、もうひとつのAIコードレビューアシスタントです。
- **Zizmor**: GitHub Actions ワークフローのセキュリティ脆弱性を静的解析するツールです。`.github/workflows/zizmor.yml` にて GitHub Actions として設定されており、生成されたSARIFレポートは GitHub Code Scanning にアップロードされます。パブリックリポジトリでは無料で利用可能です。
- **Repomix**: リポジトリ全体のソースコードをAIが読みやすい単一ファイル（XML形式）にパッケージングするツールです。`.github/workflows/repomix.yml` にて GitHub Actions として設定されており、生成されたファイル（`repomix-output.xml`）は Artifacts としてダウンロードでき、LLMのコンテキストとしてそのまま活用できます。

## Deployment

This application is configured for deployment to AWS S3 and CloudFront as static content. The deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`).

## Contributing

We welcome contributions from the community! Whether it's a bug report, a new feature suggestion, or a pull request, your help is appreciated.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Author

- **genzouw** - [genzouw@gmail.com](mailto:genzouw@gmail.com)
