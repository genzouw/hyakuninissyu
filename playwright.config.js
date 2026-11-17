import { defineConfig, devices } from '@playwright/test'

const PORT = 8080
// E2E_BASE_URL を指定すると、ローカル配信の代わりにそのホスト（本番など）を巡回する (#604)
const EXTERNAL_BASE_URL = process.env.E2E_BASE_URL
const BASE_URL = EXTERNAL_BASE_URL || `http://127.0.0.1:${PORT}`

// 外部ホスト（本番など）を巡回するときも、両方のプロジェクトを実行する。
// WebKit は、CSP の違反と「report-to の無い Report-Only の CSP は効果が無い」という警告を
// console error として出す。本番の CSP は本適用（Content-Security-Policy）で、実際の読み込みと
// 揃っているため、mobile-webkit も通る（genzouw/genzouw.com#460）。CSP を Report-Only に戻すと
// mobile-webkit は全ルートで失敗する。
const PROJECTS = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // iPhone のブラウザは原則 WebKit で動くため、スマートフォン幅 + WebKit でも同じスモークを回す
  { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
]

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
  projects: PROJECTS,
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
