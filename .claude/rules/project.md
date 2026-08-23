# Hyakunin Isshu - Project Specific Rules

## Strict Free-Tier Only Policy

- The project CI/CD must exclusively use services and tools that are completely free for public OSS repositories.
- Paid plans, licenses, trials, seat-based billing, and usage-based/pay-as-you-go API tokens are strictly forbidden.
- Never add LLM provider API keys (e.g. `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) to GitHub Secrets.
- Include manual pre-merge setup steps in PRs only when the change actually requires them, to enable free tiers or avoid paid plans.

## Package Manager

- **Bun** is the exclusive package manager. Never use `npm`, `yarn`, or `pnpm`.
- GitHub Actions must use `oven-sh/setup-bun` instead of `actions/setup-node`.
- Use `bun x` instead of `npx`.

## Tech Stack & Styling

- Use **Bootstrap 5** utility classes (`ms-*`, `me-*`, etc.). Legacy Bootstrap 4 classes (`ml-*`, `mr-*`) are prohibited.
- Text-to-Speech (TTS) must exclusively use `src/composables/useSpeech.js`. Do not implement TTS elsewhere, and do not pass arguments to `speechSynthesis.cancel()`.
- Use Vue 3, Vue Router, Vuex 4. Route parameters should be path-based (e.g. `/playing/:countOfQuestions`).
- External links (`<a target="_blank">`) must include `rel="noopener noreferrer"`.

## CI/CD and GitHub Actions Security

- Workflows must follow the Principle of Least Privilege. Top-level `permissions` should be minimized, and individual jobs must explicitly declare required permissions.
- Do not use `pull_request_target` triggers; use `pull_request` instead to prevent secret leaks from forks.
- Always run `bun run build` with `NODE_OPTIONS=--openssl-legacy-provider`.
- Do not override `concurrency` setting with `cancel-in-progress: true` in deployment workflows (e.g., `deploy.yml`).

## Conventions

- Use Japanese for pull request descriptions, source code comments, and commit messages.
- Commit messages must follow Conventional Commits (e.g., `chore(security):`).
