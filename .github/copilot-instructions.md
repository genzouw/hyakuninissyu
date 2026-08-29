# GitHub Copilot Instructions for Hyakunin Isshu

## 最重要原則: 完全無料の SaaS・AI・ツールのみを利用する (MUST)

本リポジトリは公開 OSS です。CI/CD および自動化ワークフローに組み込んでよいのは、**公開 OSS リポジトリで完全無料 (課金が一切発生しない) な SaaS / AI / ツールのみ** です。

- **禁止**: LLM プロバイダの API キーを GitHub Secrets に登録し、CI から呼び出す構成の追加。
  `GEMINI_API_KEY` / `GOOGLE_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `CLAUDE_API_KEY` / `MISTRAL_API_KEY` / `GROQ_API_KEY` / `DEEPSEEK_API_KEY` / `PERPLEXITY_API_KEY` などが該当します。
- **禁止**: 従量課金の検索 API (`TAVILY_API_KEY` / `EXA_API_KEY` / `SERPAPI_KEY` 等) の CI 組み込み。
- **禁止**:「無料枠に収まる前提」での従量課金 API 利用。レート制限超過で課金が始まる構造そのものを禁止します。
- **禁止**: 有料プラン / 有料トライアル / クレジットカード登録を必要とするサービスの導入、およびオーナーへの新規 Secret 登録依頼。
- **許可**: 公開 OSS 向けに完全無料の GitHub Action / GitHub App、Secrets 不要のローカル LLM、リポジトリ内で完結するスクリプト。
- **許可**: 開発者個人のローカル環境で自分の負担で AI ツールを使うこと。禁止しているのは CI/CD への組み込みです。

判断に迷ったら PR を作らず Issue でオーナー (@genzouw) に相談してください。詳細は [`AGENTS.md`](../AGENTS.md) を参照してください。

When assisting with code generation or answering questions about this repository, please adhere to the following guidelines:

## Technology Stack

- **Package Manager:** Bun (Always use `bun install`, `bun run dev`, `bun run unit`, `bun run lint`, `bun run build`). Never use `npm`.
- **Framework:** Vue 3 (Options API and Composables), Vuex 4, Vue Router.
- **スタイリング:** Bootstrap 5（Bootswatch Yeti テーマ）、bootstrap-vue-next。
- **Testing:** Jest and `@vue/test-utils` (prefer `shallowMount` and `global.mocks`).
  - mounted フックでデータが上書きされる場合は、マウント後に `wrapper.vm` へ値を再代入してください。
  - mounted フック実行前に状態を確定させる必要がある場合は、`shallowMount` の `data` オプションを使用してください。
  - `wrapper.element.querySelector()` などのネイティブ DOM メソッドではなく、`wrapper.find()` や `wrapper.text()` などのライブラリ固有のメソッドを優先してください。

## Development Rules

1. **Language:** Use **Japanese** for all code comments, documentation, and commit/PR messages.
2. **Security First:**
   - Ensure all external links include `target="_blank"` and `rel="noopener noreferrer"`.
   - Do not generate code that logs or exposes credentials, API keys, or sensitive internal URLs.
3. **Styling:** Use modern Bootstrap 5 utility classes (e.g., `ms-*`, `me-*`, `mb-3`) instead of legacy Bootstrap 4 classes.
4. **Composables:** For any text-to-speech functionality, import and use the `useSpeech` composable from `src/composables/useSpeech.js`.
   - `speechSynthesis.cancel()` を呼び出す際は、引数を渡さないでください。
5. **Constants:** モジュールスコープの定数に対して破壊的な変更を行わないでください（`map` とスプレッド演算子などを使用して新しいオブジェクトを作成してください）。

## GitHub Actions

- All CI/CD workflows should execute natively using Bun via `oven-sh/setup-bun` instead of Node.js/npm.
