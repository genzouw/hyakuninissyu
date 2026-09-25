import fs from 'node:fs'
import { test, expect } from '@playwright/test'
import { extractStaticPaths } from '../../build/sitemap.mjs'

// パラメータ不要の公開ルートは sitemap.xml と同じ抽出ロジックで src/router/index.js から取得し、
// ルートを追加してもスモークの対象から漏れないようにする
const ROUTES = extractStaticPaths(fs.readFileSync('src/router/index.js', 'utf8'))

// 抽出に失敗して 0 件のまま緑になるのを防ぐ
test('検査対象のルートを 1 件以上抽出できている', () => {
  expect(ROUTES.length).toBeGreaterThan(0)
})

// 検査したいのは自前のバンドルであり外部スクリプトの可用性ではないため、
// AdSense / Twitter widgets / GA は空スクリプトで応答する。
// abort にすると Chromium が net::ERR_FAILED を console error として出すため fulfill を使う
test.beforeEach(async ({ page }) => {
  await page.route(/pagead2\.googlesyndication\.com|platform\.twitter\.com|www\.googletagmanager\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  )
})

for (const path of ROUTES) {
  test(`ランタイムエラーなく表示できる: ${path}`, async ({ page }) => {
    const pageErrors = []
    const consoleErrors = []
    page.on('pageerror', (e) => pageErrors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
    })

    const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
    expect(response, `no response for ${path}`).not.toBeNull()
    expect(response.status(), `HTTP status for ${path}`).toBeLessThan(400)
    await expect(page.locator('#app')).toBeVisible()

    // タイマー表示が初期値から進むまで待ち、UPDATE_TIME の遅延コールバックで出るエラーを取りこぼさない
    if (path === '/time-attack') {
      await expect(page.locator('p.display-4').first()).not.toHaveText('00:00.00')
    }

    expect(pageErrors, `unhandled page errors on ${path}`).toEqual([])
    expect(consoleErrors, `console errors on ${path}`).toEqual([])
  })
}
