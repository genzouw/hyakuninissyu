/**
 * ビルド時に `dist/sitemap.xml` を生成する。
 *
 * `bun run build` から webpack のビルド後に実行される。
 * 生成規則は build/sitemap.mjs を参照。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSitemapXml } from './sitemap.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const ROUTER_SOURCE_PATH = path.resolve(currentDir, '../src/router/index.js');
const OUTPUT_PATH = path.resolve(currentDir, '../dist/sitemap.xml');

const routerSource = await fs.readFile(ROUTER_SOURCE_PATH, 'utf8');
const xml = await buildSitemapXml(routerSource);

await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await fs.writeFile(OUTPUT_PATH, xml);

console.log(`  sitemap.xml generated: ${OUTPUT_PATH}\n`);
