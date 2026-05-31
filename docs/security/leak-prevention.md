# 情報漏洩防止の全体像と責任分界

本リポジトリでは、インフラ情報・認証情報・シークレットが意図せず公開されることを防ぐため、以下の多層防御を構築しています。

## 1. コミット前検知（ローカル防御層）

開発者およびAIエージェントのローカル環境でのコミットを防ぐ第一の防御層です。

- **仕組み**: `pre-commit` フックにより `gitleaks`、`detect-private-key`、および `detect-aws-credentials` を実行。
- **設定ファイル**: `.pre-commit-config.yaml`
- **開発者の責任**: リポジトリをクローンしたのち、必ず `pre-commit install` を実行し、コミット時にフックが機能するようにすること。
- **補完**:
  - `.gitignore` にて各種シークレットファイルやAIエージェントの作業履歴を除外し、事故を根本から防止。
  - `.gitattributes` にてシークレット関連ファイルの diff 出力を無効化（`-diff`）し、レビュー時の意図しない露出を防止。
  - `.vscode/settings.json` により、AI エージェント（Copilot / Cursor 等）のワークスペース走査からシークレットファイルを除外。

## 2. CI 検知（中央防御層）

PRやPush時に実行される第二の防御層です。

- **仕組み**: GitHub Actionsによる継続的なスキャン。
  - `pre-commit.yml`: ローカルでセットアップ漏れがあった場合や意図的な `--no-verify` によるバイパスを防ぐため、CI環境上でリポジトリ全体に対して `pre-commit` フックを強制実行します。
  - `gitleaks.yml`: PR差分およびスケジュールでリポジトリ全体の履歴をスキャン。
  - `trivy.yml`: ファイルシステムのシークレットスキャン。
  - `actionlint.yml`: GitHub Actions ワークフローの静的解析および `shellcheck` 連携によるシェルスクリプトの脆弱性（インジェクション等）検知。
  - `codeql.yml`: `security-extended` および `security-and-quality` クエリによる高度な脆弱性・コード品質の検知（一部のハードコードされた認証情報パターンも含む）。
  - `dependency-review.yml`: PRで新たに追加・更新される依存パッケージ（OSS）に既知の脆弱性が含まれていないかをスキャン。
- **運用上の責任**: CIが落ちた場合、対象のコミットに含まれる漏洩疑いのコードを適切に修正し（必要であればシークレットをローテートし）、マージブロックを解消すること。

## 3. 定期監査と自動防御

継続的な監視と外部からの自動防御機構です。

- **仕組み**:
  - `codeql.yml`, `trivy.yml`, `gitleaks.yml` のスケジュール実行による監査。
  - `sbom.yml` による SBOM (Software Bill of Materials) の自動生成と、GitHub Dependency Graph への依存関係の登録（リポジトリの Settings → Security → Code security and analysis から Dependency graph を有効化すること）。
  - GitHub Secret Scanning と Push Protection（リポジトリの Settings → Security → Code security and analysis から必ず有効化すること）。
- **対応**: 過去の履歴に漏洩が検知された場合や、依存パッケージに脆弱性が発見された場合は、すみやかにセキュリティポリシー（`SECURITY.md`）に従って対処すること。

## 万が一漏洩してしまった場合

シークレットがプッシュされてしまった場合は、**該当のシークレットを直ちに無効化（ローテート）してください**。コミット履歴からの削除（force push等）だけでは、すでにサードパーティに漏洩しているリスクを排除できません。その後、本ドキュメントや防御設定のギャップを埋める改善を検討してください。

### AIエージェントコンテキストの漏洩防止について

AIエージェントの作業ディレクトリ（`.claude/`, `.cursor/`, `.aider*/`, `.continue/`, `.windsurf/`, `.cline/` など）は、`.gitignore` で除外されていることに加え、万が一ステージングされた場合でも `.gitattributes` によって diff 出力が無効化（`-diff`）されています。これにより、PRレビュー等の過程でエージェントが保持しているシークレットやプロンプト履歴が意図せず露出することを防ぎます。

### detect-secrets によるベースライン管理

新たに `detect-secrets` を導入し、`.secrets.baseline` を用いたシークレット混入のベースライン管理を追加しました。

- 既存のソースコードに含まれる誤検知等はベースラインとして除外され、新規コミット時にのみ新たに混入したシークレットを `pre-commit` フックで検知します。

#### 開発環境の前提条件とセットアップ

ローカル環境でベースラインの更新や検証を行うには、以下の環境が必要です。

- Python: >= 3.8
- パッケージマネージャー: pip

  ```bash
  pip install detect-secrets==1.5.0
  ```
