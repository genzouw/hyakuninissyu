import { defineConfig, devices } from '@playwright/test'

const PORT = 8080
const BASE_URL = `http://127.0.0.1:${PORT}`

// ビルド済みの dist を history fallback (-s) 付きで配信して巡回する。
// 事前に `bun run build` が必要（`bun run test:e2e` は pretest:e2e で実行する）。
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `bun x --bun serve@14.2.6 dist -s -l ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
