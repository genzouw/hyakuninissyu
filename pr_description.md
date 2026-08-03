## 背景

対象リポジトリ（genzouw/hyakuninissyu）では、`gitleaks`, `trufflehog`, `detect-secrets` などのコミット前（ローカル）検知機構と、CI（`codeql`, `trivy`, `actionlint` 等）の多重防御がすでに充実しています。しかし、現状では `pull_request_target` のような危険なワークフロー設定やシェルインジェクションの脆弱性を `actionlint` を用いて検出する仕組みがCI上のみに存在し、ローカル（コミット前）で即座に検知・ブロックする仕組み（シフトレフト）が不足していました。

## 現状認識（事前調査結果のサマリー）

- 既存防御策: CIには `actionlint.yml`, `codeql.yml`, `trivy.yml` 等が導入済み。ローカルには `gitleaks`, `trufflehog` 等の `pre-commit` フックが導入済み。
- 未カバー領域: GitHub Actions ワークフローの設定ミス（例: 危険な `pull_request_target` の使用など）のローカル環境での自動ブロック機構（CIに到達する前の検知）。
- 直近の漏洩リスク兆候: 特になし（既存の防御層が有効に機能している状態）。

## このPRで導入・強化するもの

- 対象: 既存の `.pre-commit-config.yaml` への追加設定、および `docs/security/leak-prevention.md` への記載追加
- ツール名とバージョン: `actionlint` (v1.7.6)
- 期待される効果: 開発者がローカルでコミットする前に GitHub Actions ワークフローの脆弱性や設定ミス（例: インジェクション、不要な権限付与、`pull_request_target` の悪用リスク）を即座に検出し、意図しない設定変更が PR として提出されることを未然に防ぎます。

## 検知漏れリスクと補完策

- 検知できないケース: ワークフロー内の外部スクリプトの複雑な脆弱性や、`actionlint` がサポートしていないサードパーティ・アクションの動的な振る舞い。
- 補完策: 既存のCIワークフロー（`zizmor.yml`, `codeql.yml` など）による多層的な分析と、Pull Request 時のレビュアーによる確認で二重化。

## マージ前に必要な手動作業（チェックリスト）

レビュアーは PR をマージする前に必ず以下を実施してください。
本 PR の CI は手動作業完了を前提に通る設計です。

- [ ] developer 各自のローカルで `pre-commit install` を実行し、追加された hook を反映させる周知

## マージ後の確認手順

- [ ] 次の push / PR で追加した hook がCI上の `pre-commit.yml` で問題なく green になることを確認
- [ ] ローカルで `actionlint` がフックとして動作することを確認

## ロールバック手順

問題が出た場合は、本PRの対象コミットを `git revert` していただくか、`.pre-commit-config.yaml` から `actionlint` の設定ブロックのみを削除してください。

## 参考情報

- 公式ドキュメント: https://github.com/rhysd/actionlint
