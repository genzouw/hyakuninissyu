import { defineConfig, devices } from '@playwright/test'

const PORT = 8080
// E2E_BASE_URL を指定すると、ローカル配信の代わりにそのホスト（本番など）を巡回する (#604)
const EXTERNAL_BASE_URL = process.env.E2E_BASE_URL
const BASE_URL = EXTERNAL_BASE_URL || `http://127.0.0.1:${PORT}`

const PROJECTS = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // iPhone のブラウザは原則 WebKit で動くため、スマートフォン幅 + WebKit でも同じスモークを回す
  { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
]

// 外部ホストを巡回するときは chromium だけを実行する。
// 本番 CloudFront が返す Content-Security-Policy-Report-Only の違反を、WebKit だけが
// console error として出すため、mobile-webkit は全ルートで失敗する。CSP 側が
// 実際の読み込み（Google Fonts・AdSense・Twitter ウィジェット）と揃ったら mobile-webkit も加える。
const ACTIVE_PROJECTS = EXTERNAL_BASE_URL
  ? PROJECTS.filter(({ name }) => name === 'chromium')
  : PROJECTS

// 既定では、ビルド済みの dist を history fallback (-s) 付きで配信して巡回する。
// 事前に `bun run build` が必要（`bun run test:e2e` は pretest:e2e で実行する）。
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  projects: ACTIVE_PROJECTS,
  webServer: EXTERNAL_BASE_URL
    ? undefined
    : {
        command: `bun x --bun serve@14.2.6 dist -s -l ${PORT}`,
        url: BASE_URL,
        // dev server (8080) や古いビルドを検査しないよう、ポート使用中は起動失敗にする
        reuseExistingServer: false,
        timeout: 120_000,
      },
})
