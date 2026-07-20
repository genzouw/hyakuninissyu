## 背景

事前調査の結果、本リポジトリではすでに `pre-commit` フック（Gitleaks、TruffleHog 等）によるローカル検知や、`trivy`、`codeql` を始めとする多層的な CI 検知が導入され、GitHub Actions の権限も最小化されていることが確認できました。一方で、定期監査における Dependabot が、`npm` の Jest スタック以外（`github-actions`、`docker`、`pip`）では個別のプルリクエストを生成しており、依存パッケージ更新のノイズが大きく、監査の追従性に課題があることが分かりました。

## 現状認識（事前調査結果のサマリー）

- 既存防御策: `gitleaks.yml`, `codeql.yml`, `trivy.yml`, `osv-scanner.yml` 等による多層防御、および `pre-commit` によるローカル防御が導入済み
- 未カバー領域: Dependabot の設定において `github-actions`, `docker`, `pip` のグルーピング設定がなく、定期監査時の PR ノイズが発生
- 直近の漏洩リスク兆候: `.env` ファイル等の流出痕跡なし。Secret Scanning / Push Protection は既にドキュメント化済み

## このPRで導入・強化するもの

- 対象: `.github/dependabot.yml` および `docs/security/leak-prevention.md`
- ツール名とバージョン: GitHub Dependabot (公式機能、無料)
- 期待される効果: 各エコシステムの依存パッケージ更新を1つの PR にグルーピングすることで、定期監査におけるレビューコスト（ノイズ）を低減し、漏洩防止等に関わる重要なセキュリティツール（`gitleaks`, `trufflehog` 等のアクションや `pip` パッケージ）の最新化を確実に追従可能にする

## 検知漏れリスクと補完策

- 検知できないケース: シークレット等の漏洩自体を直接防ぐものではない
- 補完策: 既存の `pre-commit` フック、CI セキュリティスキャン、GitHub Secret Scanning と Push Protection により二重、三重に保護されている

## マージ前に必要な手動作業（チェックリスト）

レビュアーは PR をマージする前に必ず以下を実施してください。
本 PR の CI は手動作業完了を前提に通る設計です。

- [ ] GitHub repo settings → Code security → Push protection を有効化（未実施の場合）
- [ ] 開発チーム全体へ Dependabot による更新PRが1本化される旨を周知

## マージ後の確認手順

- [ ] 次回の Dependabot 実行スケジュール（毎週月曜日）にて、各エコシステムの PR がグループ化されて作成されることを確認

## ロールバック手順

- `.github/dependabot.yml` から追加した `groups` セクションを削除して元の設定に戻す。

## 参考情報

- 公式ドキュメント: https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#groups
- 比較検討した他案: 新たな CI スキャンツールの導入を検討したが、既存ツールで網羅されているため、構成ファイルの強度向上（運用効率の改善）を優先
