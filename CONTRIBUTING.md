# Contributing to Hyakunin Isshu

First off, thank you for considering contributing to Hyakunin Isshu! It's people like you that make open-source projects such a great community.

We welcome contributions of all kinds, including bug reports, feature requests, documentation improvements, and code changes.

## How Can I Contribute?

### Reporting Bugs

If you find a bug in the application, please help us by reporting it! Before creating a new bug report, please check the [existing issues](https://github.com/genzouw/hyakuninissyu/issues) to see if it has already been reported.

When creating a new bug report, please include:
- A clear and descriptive title.
- A detailed description of the problem.
- Steps to reproduce the bug.
- The expected behavior vs. the actual behavior.
- Screenshots or error logs if applicable.
- Your environment details (OS, browser, Node.js version, etc.).

### Suggesting Enhancements

We are always looking for ways to improve! If you have an idea for a new feature or an enhancement to an existing one, please submit an issue.

When suggesting an enhancement, please include:
- A clear and descriptive title.
- A detailed description of the proposed feature and its use case.
- Any relevant mockups or examples.

### Pull Requests

We love pull requests! If you're ready to contribute code or documentation, please follow these steps:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hyakuninissyu.git
   cd hyakuninissyu
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/genzouw/hyakuninissyu.git
   ```
4. **Create a new branch** for your feature or bugfix. Use a descriptive name:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
5. **Install dependencies**:
   ```bash
   npm install
   ```
6. **Make your changes** and ensure everything works locally by running the development server (`npm run dev`).
7. **Write tests** for your changes if applicable.
8. **Run tests and linting** to ensure your code meets our quality standards:
   ```bash
   npm run lint
   npm test
   ```
9. **Commit your changes**. Please write clear and concise commit messages.
10. **Push your branch** to your fork on GitHub:
    ```bash
    git push origin your-branch-name
    ```
11. **Submit a Pull Request**. Go to the original repository and click "New pull request". Fill out the provided Pull Request template to explain your changes.

## Development Setup

To set up the project locally for development:

1. Ensure you have Node.js (`>=18.18.0`) and npm (`>=9.0.0`) installed.
2. Clone the repository and run `npm install`.
3. Use `npm run dev` to start the local development server at `http://localhost:8080`.
4. Run `npm run lint` to check for style issues.
5. Run `npm run unit` to run unit tests.

## Code Style

This project follows standard Vue.js and JavaScript conventions, enforced by ESLint. Please make sure to run `npm run lint` before submitting a pull request to ensure your code complies with our styling rules.

Thank you for your contributions!
