import { test, expect } from '@playwright/test'

// 表示が時刻や乱数に依存しない公開ルートだけを撮る。
// /time-attack と /daily-challenge はタイマーや日付で表示が変わるため対象外にしている
const ROUTES = [
  { path: '/', name: 'top' },
  { path: '/badges', name: 'badges' },
  { path: '/collection', name: 'collection' },
]

// test/e2e/smoke.spec.js と同じく、AdSense / Twitter widgets / GA / Sentry Loader は空スクリプトで応答する。
// 外部スクリプトが差し込む広告やボタンは撮るたびに変わるため、読み込ませない。
// Sentry Loader はキー無しのビルドでは出力されないが、キー入りのビルドで撮っても本番の Sentry へ送らないよう揃えておく
const STUBBED_HOSTS = new Set([
  'pagead2.googlesyndication.com',
  'platform.twitter.com',
  'www.googletagmanager.com',
  'js.sentry-cdn.com',
  'browser.sentry-cdn.com',
])

test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => STUBBED_HOSTS.has(url.hostname),
    (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  )
})

for (const { path, name } of ROUTES) {
  test(`見た目が基準画像と一致する: ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('#app')).toBeVisible()
    // Bootswatch Yeti は Google Fonts の Open Sans を読み込む。差し替え前後の文字幅で撮らないよう待つ
    await page.evaluate(() => document.fonts.ready)

    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
  })
}
