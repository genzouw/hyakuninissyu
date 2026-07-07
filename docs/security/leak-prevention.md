# 情報漏洩防止の全体像と責任分界

本リポジトリでは、インフラ情報・認証情報・シークレットが意図せず公開されることを防ぐため、以下の多層防御を構築しています。

## 1. コミット前検知（ローカル防御層）

開発者およびAIエージェントのローカル環境でのコミットを防ぐ第一の防御層です。

- **仕組み**: Husky の `pre-commit` フック (`.husky/pre-commit`) により `pre-commit run` を呼び出し、`.pre-commit-config.yaml` で定義された `gitleaks`、`detect-private-key`、`detect-aws-credentials` などを包括的に実行します。
  - 加えて、`.pre-commit-config.yaml` にカスタムローカルフック (`forbid-sensitive-files`) を導入し、`.env` ファイル、各種キーファイル (`*.pem`, `*.key`)、インフラ状態ファイル (`*.tfstate`)、各種証明書やSSH鍵（`*.cert`, `*.p12`, `id_rsa`等）、クラウドサービスアカウント（`*service-account*.json`）、パッケージマネージャー設定 (`.npmrc`, `.yarnrc*`, `.bunfig.toml`, `bunfig.toml`)、DBダンプ (`*.db`, `*.dump`, `*.sqlite*`等)、および AI エージェントの作業ディレクトリ (`.claude/`, `.cursor/`, `.aider*/`等) などのステージング・コミットを明示的にブロックしています。
- **設定ファイル**: `.pre-commit-config.yaml` および `.husky/pre-commit`
- **開発者の責任**: リポジトリをクローンしたのち、必ず `pip install -r requirements.txt` を実行し、ローカル環境で包括的なシークレット検知が機能するようにすること。
- **マージ前の手動作業（必須）**: GitHub Secret Scanning および Push Protection が有効化されていない場合は、リポジトリの Settings → Security → Code security and analysis から必ず有効化してください。
- **補完**:
  - `pre-commit` のローカルフック（`forbid-sensitive-files`）にて、`.env` ファイル、各種資格情報（`credentials`, `*.pem`, `*.tfstate`等）、およびAIエージェントの作業履歴（`.claude/`, `.cursor/`, `.aider*` 等）が誤ってステージングされることを明示的にブロックしています。
  - `.gitignore` にて各種シークレットファイルやAIエージェントの作業履歴を除外し、事故を根本から防止。
  - `.gitattributes` にてシークレット関連ファイルの diff 出力を無効化（`-diff`）し、レビュー時の意図しない露出を防止。
  - `.vscode/settings.json` により、AI エージェント（Copilot / Cursor 等）のワークスペース走査からシークレットファイル、パッケージマネージャーの設定ファイル (`.npmrc`, `.yarnrc*`（`.yarnrc.yml` を含む）, `.bunfig.toml`, `bunfig.toml`)、各種証明書・SSH鍵、クラウドサービスアカウント、およびデータベースのダンプファイル等 (`*.db`, `*.dump`, `*.bak`, `*.sqlite*`) を除外。

## 2. CI 検知（中央防御層）

PRやPush時に実行される第二の防御層です。

- **仕組み**: GitHub Actionsによる継続的なスキャン。
  - **対象ブランチの拡張**: `pre-commit.yml`, `gitleaks.yml`, `trivy.yml`, `trufflehog.yml`, `codeql.yml`, `osv-scanner.yml`, `actionlint.yml`, `zizmor.yml` といった主要なセキュリティスキャンワークフローは、**デフォルトブランチへのプッシュ時**および**すべてのブランチへのプルリクエスト時**（ワイルドカード `**` を使用）に自動実行されるよう構成されています。これにより、デフォルトブランチ以外の開発作業であっても、プルリクエストの段階でシークレット漏洩や脆弱性を確実に検知・ブロックしつつ、プッシュ時の無駄な重複実行によるCIリソースの消費を防いでいます。なお `actionlint.yml` のみ `paths` フィルタ（`.github/workflows/**` 等）を併用しているため、対象ブランチは拡張されていますが、実行されるのは GitHub Actions 関連ファイルが変更されたプッシュ／PR に限られます。
  - `pre-commit.yml`: ローカルでセットアップ漏れがあった場合や意図的な `--no-verify` によるバイパスを防ぐため、CI環境上でリポジトリ全体に対して `pre-commit` フックを強制実行します。
  - `gitleaks.yml`: プッシュ時・PR差分およびスケジュールでリポジトリ全体の履歴をスキャン。
  - `trivy.yml`: ファイルシステムおよび依存関係のシークレット・脆弱性スキャン。
  - `actionlint.yml`: GitHub Actions ワークフローの静的解析および `shellcheck` 連携によるシェルスクリプトの脆弱性（インジェクション等）検知。
  - `zizmor.yml`: GitHub Actions ワークフローに特化したセキュリティ静的解析ツール。`actionlint` よりも踏み込んだ設定ミス（過剰な `permissions`、認証情報の永続化、信頼できない入力の利用など）を検知し、結果を SARIF 形式で GitHub Code Scanning へアップロードします（ジョブレベルで `security-events: write` を付与）。
  - `codeql.yml`: `security-extended` および `security-and-quality` クエリによる高度な脆弱性・コード品質の検知（一部のハードコードされた認証情報パターンも含む）。
  - `dependency-review.yml`: PRで新たに追加・更新される依存パッケージ（OSS）に既知の脆弱性が含まれていないかをスキャン。
  - `osv-scanner.yml`: OSS 依存パッケージの既知脆弱性（OSV データベース照合）をスキャン。「3. 定期監査と自動防御」のスケジュール実行に加え、本拡張によりプッシュ時・PR時の CI 検知としても動作し、検出結果を SARIF 形式で GitHub Code Scanning へアップロードします（ジョブレベルで `security-events: write` を付与）。
  - `trufflehog.yml`: プッシュ時およびPR時にアクティブなシークレット検証（プロバイダAPIへの有効性確認）を実行し、実際に利用可能なシークレットの混入をリアルタイムにブロック。
- **GitHub Actions 権限の最小化**: ワークフローのトップレベル `permissions:` は最小化（デフォルトを `contents: read` または `{}` とし、不要な権限を持たせない）し、必要な書き込み・読み取り権限（`security-events: write`, `issues: write`, `pull-requests: write`, `pull-requests: read`, `checks: write`など）はジョブレベルでのみ明示的に付与してブラストラジアス（被害範囲）を最小化しています（なお、GitHub Actions の権限はワークフローレベルまたはジョブレベルでのみ設定可能であり、ステップレベルでは設定できません）。すべてのワークフローにおいて Principle of Least Privilege が徹底されています（例外として OSSF Scorecard は `read-all` を許容）。特にCIワークフロー（`lint.yml` や `reviewdog.yml` 等）では、各ジョブに必要な権限のみを厳密に割り当てています。
- **pull_request_target の使用禁止（フォークPRからの漏洩防止）**: フォーク元から悪意あるコードが送られた際、`pull_request_target` トリガーはフォークからのPRであってもベースリポジトリのシークレットにアクセスできてしまうため、漏洩の定番経路となります。本リポジトリでは原則として `pull_request_target` の使用を禁止し、安全な `pull_request` トリガーを使用することで、フォークPRからの意図しないシークレット流出を防ぎます。
- **運用上の責任**: CIが落ちた場合、対象のコミットに含まれる漏洩疑いのコードを適切に修正し（必要であればシークレットをローテートし）、マージブロックを解消すること。

## 3. 定期監査と自動防御

継続的な監視と外部からの自動防御機構です。

- **仕組み**:
  - `codeql.yml`, `trivy.yml`, `gitleaks.yml` のスケジュール実行による監査。
  - `osv-scanner.yml` による OSS 脆弱性スキャン。検出された脆弱性は SARIF 形式で GitHub Code Scanning（Advanced Security）へアップロードされ、一元的に可視化・管理されます。
  - `trufflehog.yml` によるアクティブなシークレット検証。PR・Push時のリアルタイムブロックに加え、スケジュール実行でリポジトリ全履歴に対してもプロバイダのAPIへの有効性確認を実施します。
  - `sbom.yml` による SBOM (Software Bill of Materials) の自動生成と、GitHub Dependency Graph への依存関係の登録（リポジトリの Settings → Security → Code security and analysis から Dependency graph を有効化すること）。
  - GitHub Secret Scanning と Push Protection（リポジトリの Settings → Security → Code security and analysis から必ず有効化すること）。
- **対応**: 過去の履歴に漏洩が検知された場合や、依存パッケージに脆弱性が発見された場合は、すみやかにセキュリティポリシー（`SECURITY.md`）に従って対処すること。

## 万が一漏洩してしまった場合

シークレットがプッシュされてしまった場合は、**該当のシークレットを直ちに無効化（ローテート）してください**。コミット履歴からの削除（force push等）だけでは、すでにサードパーティに漏洩しているリスクを排除できません。その後、本ドキュメントや防御設定のギャップを埋める改善を検討してください。

### AIエージェントコンテキストの漏洩防止について

AIエージェントの作業ディレクトリ（`.claude/`, `.cursor/`, `.aider*/`, `.continue/`, `.windsurf/`, `.cline/` など）は、`.gitignore` で除外されていることに加え、万が一ステージングされた場合でも `.gitattributes` によって diff 出力が無効化（`-diff`）されています。これにより、PRレビュー等の過程でエージェントが保持しているシークレットやプロンプト履歴が意図せず露出することを防ぎます。
さらに、`.vscode/settings.json` を通じて各種AIアシスタントのワークスペース走査対象からこれらと特定のファイル群（DBダンプファイルなど）を除外することで、意図しないコンテキストのインジェストやAI経由の漏洩を未然に防止しています。

### detect-secrets によるベースライン管理

新たに `detect-secrets` を導入し、`.secrets.baseline` を用いたシークレット混入のベースライン管理を追加しました。

- 既存のソースコードに含まれる誤検知等はベースラインとして除外され、新規コミット時にのみ新たに混入したシークレットを `pre-commit` フックで検知します。

#### 開発環境の前提条件とセットアップ

ローカル環境でベースラインの更新や検証を行うには、以下の環境が必要です。

- Python: >= 3.8
- パッケージマネージャー: pip

  ```bash
  pip install -r requirements.txt
  ```

### Dependabot による定期監査と自動アップデート

Dependabot を用いて、定期的に利用パッケージのアップデートを確認・適用しています。

- `.github/dependabot.yml` にて `npm`, `github-actions`, `docker` などの依存エコシステムを設定し、最新のパッケージ（特に脆弱性修正が含まれるバージョン）へ自動的に追従できるようにしています。
- これにより、`docker` で利用するイメージや CI 上のアクション等の防衛層が、脆弱性修正を含む最新バージョンへ追従し、セキュリティ態勢を維持します。なお、シークレット検出パターン自体の更新は Dependabot の対象外であり、gitleaks や trufflehog 等のツールが担当します。
- また、`pip` を追加したことで、`pre-commit` や `detect-secrets` などのローカルおよび CI 上のシークレット検知ツールのバージョンアップにも自動追従できるようになります。

### 新規追加: pre-commit ローカル防御フックの厳格化

さらに、意図しない機密情報（AIの作業ディレクトリ、汎用的なシークレットファイル、パッケージマネージャーの設定ファイル、DBのダンプファイル等）の漏洩を未然に防ぐため、`.pre-commit-config.yaml` にてローカル専用のカスタムフック `forbid-sensitive-files` を追加しました。これにより、`.gitignore` や `.gitattributes` での漏れがあった場合でも、コミットの段階でステージングを自動的にブロックし、多層的な防御をより強固にしています。

### ライセンスコンプライアンス監査

定期的な監査の一環として、利用している依存パッケージ（OSS）のライセンスコンプライアンス監査を導入しています。

- `.github/workflows/license-compliance.yml` にて、`license-checker` を利用して予期せぬ商用利用不可ライセンス（GPL 等）が混入していないかを確認します。
- このスキャンは、PR時、プッシュ時、およびスケジュールトリガーにより自動で実行され、法務リスクの低減に寄与します。
