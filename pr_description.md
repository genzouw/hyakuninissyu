## 目的
既存の ESLint と Knip の設定を見直し、保守性とコードの品質を向上させる。

## 導入する/変更するもの
- `eslint-plugin-playwright` および `eslint-plugin-jest` の導入と設定追加 (`eslint.config.mjs`)。
- `knip.jsonc` の不要な `ignoreDependencies` および `ignoreBinaries` 記述の削除。
- 関連する依存関係の更新 (`package.json`, `bun.lock`)。

## 「公開 OSS で完全無料」の証明
今回追加したパッケージ (`eslint-plugin-playwright`, `eslint-plugin-jest`, `typescript`) はすべて npm でオープンソースとして無料で提供されているツールであり、課金や API キーなどは一切不要です。
- [eslint-plugin-playwright](https://www.npmjs.com/package/eslint-plugin-playwright)
- [eslint-plugin-jest](https://www.npmjs.com/package/eslint-plugin-jest)

## 既存ツールとの重複がないことの確認
本プロジェクトでは ESLint による静的解析が既に導入されていますが、ユニットテスト (`test/unit`) や E2E テスト (`test/e2e`) に特化したルールセットは適用されていませんでした。今回の変更は既存の静的解析ツール (ESLint) のルール拡張であり、重複するツールを新規導入するものではありません。

## マージ前に必要な手動セットアップ手順
特になし。既存の CI ワークフローでそのまま動作します。

## 想定リスクとロールバック手順
- **想定リスク**: テストコードにおいて新しい lint エラーが検知される可能性がありますが、テストの品質向上に繋がるため問題ありません。CI が失敗した場合は本 PR の設定を見直します。
- **ロールバック手順**: 本 PR の変更を `git revert` してください。AWS リソースへの直接的な影響はありません。

## 動作確認結果
ローカル環境にて以下のコマンドがすべて成功することを確認しました。
- `bun install`
- `bun run lint:eslint`
- `bun run knip`
- `bun run unit`
- `bun run build`
