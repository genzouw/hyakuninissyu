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

- **Bun**: `>=1.0.0` (replaces Node.js/npm)

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

- `bun run dev` - Starts the development server with hot-reload.
- `bun run build` - Builds the app for production to the `dist` folder, with minification.
- `bun run unit` - Runs unit tests using Jest.
- `bun run lint` - Lints the codebase using ESLint.

## Deployment

This application is configured for deployment to AWS S3 and CloudFront as static content. The deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`).

## Contributing

We welcome contributions from the community! Whether it's a bug report, a new feature suggestion, or a pull request, your help is appreciated.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Author

- **genzouw** - [genzouw@gmail.com](mailto:genzouw@gmail.com)
