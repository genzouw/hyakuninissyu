import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import router from '@/router'
import {
  SITE_URL,
  buildSitemapXml,
  extractStaticPaths,
} from '../../../build/sitemap.mjs'

const routerSource = readFileSync(
  resolve(__dirname, '../../../src/router/index.js'),
  'utf8'
)

describe('sitemap の生成', () => {
  it('ルート引数を含むパスを除外する', () => {
    const paths = extractStaticPaths(`
      path: '/',
      path: '/badges',
      path: '/gameSet/:countOfQuestions/:score',
      path: '/daily-challenge-result/:score/:newlyCollectedCount?',
      path: '/:pathMatch(.*)*',
    `)

    expect(paths).toEqual(['/', '/badges'])
  })

  it('同じパスを重複して出力しない', () => {
    const paths = extractStaticPaths(`
      path: '/badges',
      path: '/badges',
    `)

    expect(paths).toEqual(['/badges'])
  })

  it('ルーターに登録された静的なパスをすべて含む', () => {
    // ルート定義のソースを正規表現で読み取っているため、実際に vue-router へ
    // 登録されたパスと突き合わせ、書式の変更やルート追加で取りこぼさないことを保証する。
    const registeredStaticPaths = router
      .getRoutes()
      .map((route) => route.path)
      .filter((path) => !path.includes(':') && !path.includes('*'))
      .sort()

    expect(extractStaticPaths(routerSource).sort()).toEqual(
      registeredStaticPaths
    )
  })

  it('抽出できる URL がない場合はエラーにする', async () => {
    await expect(buildSitemapXml('routes: []')).rejects.toThrow(
      'ルート定義からサイトマップ対象の URL を抽出できませんでした'
    )
  })

  it('抽出したパスを絶対 URL として出力する', async () => {
    const xml = await buildSitemapXml(routerSource)
    const locations = Array.from(
      xml.matchAll(/<loc>([^<]+)<\/loc>/g),
      (match) => match[1]
    )

    expect(locations).toEqual(
      extractStaticPaths(routerSource).map((path) => `${SITE_URL}${path}`)
    )
    expect(locations).toContain(`${SITE_URL}/`)
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    )
  })
})
