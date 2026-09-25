import { test, expect } from '@playwright/test'

// パラメータ不要の公開ルート (src/router/index.js)
const ROUTES = ['/', '/time-attack', '/ai-battle', '/badges', '/collection', '/daily-challenge']

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
