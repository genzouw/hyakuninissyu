# 百人一首 (Hyakunin Isshu) - プロジェクト固有ルール

## 完全無料枠のみを使用する方針

- プロジェクトの CI/CD では、公開 OSS リポジトリ向けに完全無料で利用可能なサービス・ツールのみを使用してください。
- 有料プラン、ライセンス、トライアル、シート課金、従量課金（Pay-as-you-go）の API トークンは厳禁です。
- LLM プロバイダの API キー（例: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`）を GitHub Secrets に登録しないでください。
- 手動セットアップ手順は、変更が実際にそれを必要とする場合（無料枠の有効化や有料プラン回避のため）のみ、PR に記載してください。

## パッケージマネージャー

- **Bun** を唯一のパッケージマネージャーとして使用してください。`npm` / `yarn` / `pnpm` は使用しないでください。
- GitHub Actions では `actions/setup-node` ではなく `oven-sh/setup-bun` を使用してください。
- `npx` の代わりに `bun x` を使用してください。

## 技術スタックとスタイリング

- **Bootstrap 5** のユーティリティクラス（`ms-*`, `me-*` など）を使用してください。Bootstrap 4 の非推奨クラス（`ml-*`, `mr-*`）は禁止です。
- 音声合成（TTS）は `src/composables/useSpeech.js` のみを使用してください。他の箇所で TTS を実装せず、`speechSynthesis.cancel()` を呼び出す際は引数を渡さないでください。
- Vue 3, Vue Router, Vuex 4 を使用してください。ルートパラメータはパスベース（例: `/playing/:countOfQuestions`）にしてください。
- 外部リンク（`<a target="_blank">`）には `rel="noopener noreferrer"` を必ず付与してください。

## CI/CD と GitHub Actions のセキュリティ

- ワークフローは最小権限の原則に従ってください。トップレベルの `permissions` は最小限にし、各ジョブで必要な権限を明示的に宣言してください。
- `pull_request_target` トリガーは使用せず、`pull_request` を使用してください（フォーク PR からのシークレット漏洩防止）。
- `bun run build` の実行時は必ず `NODE_OPTIONS=--openssl-legacy-provider` を指定してください。
- デプロイ用ワークフロー（例: `deploy.yml`）では `concurrency` 設定を `cancel-in-progress: true` で上書きしないでください。

## コーディング規約

- プルリクエストの説明文、ソースコードのコメント、ドキュメント、コミットメッセージは日本語で記述してください。
- コミットメッセージは Conventional Commits（例: `chore(security):`）に従ってください。
