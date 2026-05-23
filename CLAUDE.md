# Hyakunin Isshu - AI Agent Instructions

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
