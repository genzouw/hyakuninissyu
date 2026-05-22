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
- Styling: Bootstrap 5 (Bootswatch Yeti theme), bootstrap-vue-next and @popperjs/core. Always use Bootstrap 5 utility classes (e.g., `ms-*`, `me-*`) instead of Bootstrap 4 deprecated classes.
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
- Text-to-speech (TTS) logic is centralized in the `useSpeech` composable (`src/composables/useSpeech.js`). Use its unified interface for `enableSpeak` state and the `speakText` method across components.
- Use Japanese for pull request descriptions, source code comments, and documentation.
