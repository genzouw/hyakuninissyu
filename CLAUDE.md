# Hyakunin Isshu - AI Agent Instructions

## 最重要原則: 完全無料の SaaS・AI・ツールのみを利用する (MUST)

本リポジトリは公開 OSS です。CI/CD および自動化ワークフローに組み込んでよいのは、**公開 OSS リポジトリで完全無料 (課金が一切発生しない) な SaaS / AI / ツールのみ** です。

- **禁止**: LLM プロバイダの API キーを GitHub Secrets に登録し、CI から呼び出す構成の追加。
  `GEMINI_API_KEY` / `GOOGLE_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `CLAUDE_API_KEY` / `MISTRAL_API_KEY` / `GROQ_API_KEY` / `DEEPSEEK_API_KEY` / `PERPLEXITY_API_KEY` などが該当します。
- **禁止**: 従量課金の検索 API (`TAVILY_API_KEY` / `EXA_API_KEY` / `SERPAPI_KEY` 等) の CI 組み込み。
- **禁止**: 「無料枠に収まる前提」での従量課金 API 利用。レート制限超過で課金が始まる構造そのものを禁止します。
- **禁止**: 有料プラン / 有料トライアル / クレジットカード登録を必要とするサービスの導入、およびオーナーへの新規 Secret 登録依頼。
- **許可**: 公開 OSS 向けに完全無料の GitHub Action / GitHub App、Secrets 不要のローカル LLM、リポジトリ内で完結するスクリプト。
- **許可**: 開発者個人のローカル環境で自分の負担で AI ツールを使うこと。禁止しているのは CI/CD への組み込みです。

判断に迷ったら PR を作らず Issue でオーナー (@genzouw) に相談してください。詳細は [`AGENTS.md`](AGENTS.md) を参照してください。

## Commands

- Install dependencies: `bun install`
- Start dev server: `bun run dev`
- Run unit tests: `bun run unit`
- Run linter: `bun run lint`
- Build production bundle: `bun run build`

Note: This project uses `bun` as the package manager and task runner, completely replacing `npm`. Do not use `npm` commands.

## Architecture & Tech Stack

- Frontend: Vue.js 3 (Options API & Composables), Vuex 4, Vue Router
- スタイリング: Bootstrap 5（Bootswatch Yeti テーマ）、bootstrap-vue-next、`@popperjs/core` を使用します。Bootstrap 5 のユーティリティクラス（例: `ms-*`, `me-*`）を常に使用し、Bootstrap 4 の非推奨クラスは使わないでください。
- Test Framework: Jest and @vue/test-utils. Tests typically use `shallowMount` and mock global properties within the `global.mocks` configuration.
  - mounted フックでデータが上書きされる場合は、マウント後に `wrapper.vm` へ値を再代入してください。
  - mounted フック実行前に状態を確定させる必要がある場合は、`shallowMount` の `data` オプションを使用してください。
  - `wrapper.element.querySelector()` などのネイティブ DOM メソッドではなく、`wrapper.find()` や `wrapper.text()` などのライブラリ固有のメソッドを優先してください。
- Deployment: Static content deployed to AWS S3 and CloudFront via GitHub Actions natively using Bun (`oven-sh/setup-bun`).

## Security Guidelines

- **External Links:** All external links (e.g., `<a>` tags) must include `target="_blank"` and `rel="noopener noreferrer"` to prevent tabnabbing attacks and protect user privacy.
- **Credentials:** Never leak access methods to execution environments (credentials, API keys, DB connection strings, internal URLs) in code or logs. Strongly prioritize deployment security.

## Code Conventions

- Ensure any new UI components or modifications use Bootstrap 5 utility classes.
- 音声合成（TTS）のロジックは `useSpeech` コンポーザブル（`src/composables/useSpeech.js`）に集約されています。各コンポーネントでは、その統一インターフェース（`enableSpeak` 状態と `speakText` メソッド）を使用してください。`speechSynthesis.cancel()` を呼び出す際は、引数を渡さないでください。
- モジュールスコープの定数に対して破壊的な変更を行わないでください（`map` とスプレッド演算子などを使用して新しいオブジェクトを作成してください）。
- Use Japanese for pull request descriptions, source code comments, and documentation.

@.claude/rules/project.md
