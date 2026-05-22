# GitHub Copilot Instructions for Hyakunin Isshu

When assisting with code generation or answering questions about this repository, please adhere to the following guidelines:

## Technology Stack
- **Package Manager:** Bun (Always use `bun install`, `bun run dev`, `bun run unit`, `bun run lint`, `bun run build`). Never use `npm`.
- **Framework:** Vue 3 (Options API and Composables), Vuex 4, Vue Router.
- **Styling:** Bootstrap 5 (Bootswatch Yeti theme).
- **Testing:** Jest and `@vue/test-utils` (prefer `shallowMount` and `global.mocks`).

## Development Rules
1. **Language:** Use **Japanese** for all code comments, documentation, and commit/PR messages.
2. **Security First:**
   - Ensure all external links include `target="_blank"` and `rel="noopener noreferrer"`.
   - Do not generate code that logs or exposes credentials, API keys, or sensitive internal URLs.
3. **Styling:** Use modern Bootstrap 5 utility classes (e.g., `ms-*`, `me-*`, `mb-3`) instead of legacy Bootstrap 4 classes.
4. **Composables:** For any text-to-speech functionality, import and use the `useSpeech` composable from `src/composables/useSpeech.js`.

## GitHub Actions
- All CI/CD workflows should execute natively using Bun via `oven-sh/setup-bun` instead of Node.js/npm.
