# GitHub Copilot Instructions for Hyakunin Isshu

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
