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

    expect(pageErrors, `unhandled page errors on ${path}`).toEqual([])
    expect(consoleErrors, `console errors on ${path}`).toEqual([])
  })
}
