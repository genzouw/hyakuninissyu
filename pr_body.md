## 背景

（事前調査で把握した現状と、検出されたギャップを 5-8 行で）
事前調査において、本リポジトリの既存防御策として `gitleaks` や `trufflehog` といったスキャンツールがすでに導入されており、トップレベルでの `permissions: contents: read` は概ね設定されていることが確認できました。しかし、一部のワークフロー (`hadolint.yml`, `lighthouse.yml`, `markdownlint.yml`, `pre-commit.yml`, `shellcheck.yml`, `trufflehog.yml`) ではジョブレベルで `permissions` が明示的に設定されていませんでした。Principle of Least Privilege（最小権限の原則）を徹底するためには、ワークフローレベルだけでなく、個々のジョブレベルにおいても必要最小限の権限（`contents: read`等）を明示することが推奨されます。

## 現状認識（事前調査結果のサマリー）

- 既存防御策: `gitleaks.yml`, `codeql.yml`, `trivy.yml` 等多数のセキュリティワークフローが導入済み。
- 未カバー領域: `hadolint.yml` 等の一部ワークフローで、ジョブレベルの `permissions` 明示が欠落。
- 直近の漏洩リスク兆候: `.env` が git history に存在しないこと等を確認。実害はないものの、ジョブレベルでの権限暗黙継承による意図せぬ権限行使リスクが残存。

## このPRで導入・強化するもの

- 対象: 既存の `.github/workflows/hadolint.yml` 他 5 件のワークフロー、および `docs/security/leak-prevention.md`。
- ツール名とバージョン: GitHub Actions の permissions 設定（ネイティブ機能）。
- 期待される効果: 全てのジョブにおいて実行権限を最小限に制限することで、悪意のある変更やアクションの脆弱性を突かれた場合の被害範囲（ブラストラジアス）を極小化する。

## 検知漏れリスクと補完策

- 検知できないケース: 万が一 GitHub Actions ランナー自体が侵害された場合など。
- 補完策: 本 PR での最小権限の徹底に加え、`scorecard.yml` などの既存ワークフローを通じて継続的に構成の健全性を監視・評価。

## マージ前に必要な手動作業（チェックリスト）

レビュアーは PR をマージする前に必ず以下を実施してください。
本 PR の CI は手動作業完了を前提に通る設計です。

- [ ] GitHub repo settings → Actions → General の "Workflow permissions" が "Read repository contents and packages permissions" に設定されていることを確認。

## マージ後の確認手順

- [ ] 次の push / PR で導入した workflow (hadolint, lighthouse等) が green になることを確認。

## ロールバック手順

万が一権限不足で CI が失敗した場合、影響のあるジョブから `permissions` ブロックを削除（または必要な権限を明示的に追加）してリバートしてください。

## 参考情報

- 公式ドキュメント: https://docs.github.com/ja/actions/security-guides/security-hardening-for-github-actions
