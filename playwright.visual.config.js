import { defineConfig, devices } from '@playwright/test'

const PORT = 8080
const BASE_URL = `http://127.0.0.1:${PORT}`

// 見た目の基準画像との比較 (#616)。
// 描画は OS・フォント・ブラウザの版で変わるため、基準画像は Playwright 公式コンテナ
// (.github/workflows/visual-regression.yml) で撮る。必須チェックの E2E スモーク
// (playwright.config.js) とデプロイ後の本番スモークはコンテナ外で test/e2e 全体を実行するので、
// 撮影比較が紛れ込まないよう設定ファイルとディレクトリを分けている。
//
// 基準画像のファイル名には既定どおりプラットフォーム名 (-linux) が付く。
// macOS で撮った画像は -darwin になり、CI の基準画像を上書きしない。
export default defineConfig({
  testDir: './test/visual',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: { baseURL: BASE_URL },
  expect: {
    toHaveScreenshot: {
      // アンチエイリアス程度の差は許容する。値は観察期間の誤検知を見て調整する
      maxDiffPixelRatio: 0.01,
    },
  },
  // Bootstrap の崩れは画面幅による折り返しで起きやすいため、デスクトップ幅とスマートフォン幅を撮る。
  // WebKit はコンテナ内の描画差の検証が増えるため、まず Chromium に限る
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `bun x --bun serve@14.2.6 dist -s -l ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
