/**
 * sitemap.xml の組み立てロジック。
 *
 * URL 一覧の唯一の情報源は `src/router/index.js` のルート定義とし、
 * ルートを追加したときに sitemap.xml の更新を忘れることがないようにしている。
 * ルート引数を含むパス (例: `/gameSet/:countOfQuestions/:score`) は
 * 到達可能な URL が実行時の状態に依存し、クロール対象として意味を持たないため除外する。
 */
import { ErrorLevel, SitemapStream, streamToPromise } from 'sitemap';

/** サイトマップに記載する URL のホスト。static/robots.txt の Sitemap 行と対になっている。 */
export const SITE_URL = 'https://hyakuninissyu.genzouw.com';

const ROUTE_PATH_PATTERN = /^\s*path: '([^']*)',$/gm;

/**
 * ルート定義のソースから、ルート引数を含まない静的なパスだけを抽出する。
 *
 * @param {string} routerSource `src/router/index.js` の内容
 * @returns {string[]} 重複を除いた静的パスの一覧
 */
export function extractStaticPaths(routerSource) {
  const routePaths = Array.from(
    routerSource.matchAll(ROUTE_PATH_PATTERN),
    (match) => match[1]
  );

  return Array.from(
    new Set(
      routePaths.filter(
        (routePath) =>
          routePath.startsWith('/') &&
          !routePath.includes(':') &&
          !routePath.includes('*')
      )
    )
  );
}

/**
 * sitemap.xml の内容を組み立てる。
 *
 * @param {string} routerSource `src/router/index.js` の内容
 * @returns {Promise<string>} sitemap.xml の内容
 */
export async function buildSitemapXml(routerSource) {
  const staticPaths = extractStaticPaths(routerSource);

  // 抽出に失敗したまま空の sitemap.xml を配信すると、検索エンジンから
  // 全 URL が消える。黙って壊れるより、ビルドを失敗させる。
  if (staticPaths.length === 0) {
    throw new Error('ルート定義からサイトマップ対象の URL を抽出できませんでした');
  }

  // lastmod / changefreq / priority は出力しない。
  // 静的サイトのビルド日時はコンテンツの更新日時と一致せず、
  // 全 URL が同じ値になるため、検索エンジンに誤った情報を与えるだけになる。
  const stream = new SitemapStream({
    hostname: SITE_URL,
    level: ErrorLevel.THROW,
    // 画像・動画・ニュース向けの拡張は使っていないため、名前空間の宣言も出力しない。
    xmlns: { news: false, xhtml: false, image: false, video: false },
  });

  for (const staticPath of staticPaths) {
    stream.write({ url: staticPath });
  }
  stream.end();

  const xml = await streamToPromise(stream);

  return `${xml.toString()}\n`;
}
