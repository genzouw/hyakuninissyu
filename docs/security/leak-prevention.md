# 情報漏洩防止の全体像と責任分界

本リポジトリでは、インフラ情報・認証情報・シークレットが意図せず公開されることを防ぐため、以下の多層防御を構築しています。

## 1. コミット前検知（ローカル防御層）

開発者および AI エージェントのローカル環境でのコミットを防ぐ第一の防御層です。

- **仕組み**: Husky の `pre-commit` フック (`.husky/pre-commit`) により `pre-commit run` を呼び出し、`.pre-commit-config.yaml` で定義された `gitleaks`、`trufflehog`、`detect-private-key`、`detect-aws-credentials`、`actionlint` などを包括的に実行します。
  - `gitleaks` は `.gitleaks.toml` の拡張設定により、シークレットだけでなく個人情報（PII: 運用者やテストユーザーのメールアドレス等）のコミットも検知・ブロックします。ただし `pii-email` ルールには以下の検知範囲の限界があります。
    - **許可リストの対象**: `genzouw@gmail.com`（メンテナが README/SECURITY/package.json に意図的に公開している連絡先）、CI Bot のコミッターアドレス（`github-actions[bot]@users.noreply.github.com`, `dependabot[bot]@users.noreply.github.com`）、および `bun` のパッチファイルパス（`patches/@scope%2Fpkg@version.patch` 等、メールアドレスと誤認識される文字列）は、完全一致の正規表現で許可リスト化されており検知対象外です。
    - **検知できない場合がある値**: 難読化された値（例: 全角文字への置換、`[at]` 等への置換、Base64 エンコード）や、正規表現のパターンに一致しない特殊な形式の PII は検知できません。
    - **GitHub Secret Scanning との併用**: `gitleaks` は正規表現ベースの検知であり完全性を保証しないため、シークレットについては GitHub Secret Scanning（上記「マージ前の手動作業」参照）を併用し、多層防御としてください。`gitleaks` は PII 検知の**一助**であり、完全なカバレッジを保証するものではありません。
  - 加えて、`.pre-commit-config.yaml` にカスタムローカルフック (`forbid-sensitive-files`) を導入し、`.env` ファイル、各種キーファイル (`*.pem`, `*.key`)、インフラ状態ファイル (`*.tfstate`, `*.tfvars`, `*.auto.tfvars`)、各種証明書や SSH 鍵（`*.cert`, `*.p12`, `id_rsa`等）、クラウドサービスアカウント（`*service-account*.json`）、各種クラウド構成ディレクトリ (`.aws/`, `.kube/`, `.gcp/`, `.azure/`, `.vercel/`, `.netlify/`)、パッケージマネージャー設定 (`.npmrc`, `.yarnrc*`, `.bunfig.toml`, `bunfig.toml`)、DB ダンプ (`*.db`, `*.dump`, `*.sqlite*`, `*.sql`等)、HTTP Archive (`*.har`)、作業ログ・デバッグ出力等のログファイル（`*.log`）、および AI エージェントの作業ディレクトリ (`.claude/`, `.cursor/`, `.aider*/`, `.roo/`, `.zeal/` 等) などのステージング・コミットを明示的にブロックしています。
- **設定ファイル**: `.pre-commit-config.yaml` および `.husky/pre-commit`
- **開発者の責任**: リポジトリをクローンしたのち、Python 仮想環境（例: `python3 -m venv venv && source venv/bin/activate`）を利用して `pip install -r requirements.txt` および `pre-commit install` を実行し、ローカル環境で包括的なシークレット検知が機能するようにすること。システム依存関係の競合を避けるため、仮想環境の利用を推奨します。
- **マージ前の手動作業（必須）**: GitHub Secret Scanning および Push Protection が有効化されていない場合は、リポジトリの Settings → Security → Code security and analysis から必ず有効化してください。
- **補完**:
  - `pre-commit` にて `trufflehog` フックを動作させ、プロバイダの API に到達可能な「アクティブなシークレット」のローカル環境でのコミットを防止します（正規表現ベースの `gitleaks` を補完する仕組みです）。
  - `pre-commit` のローカルフック（`forbid-sensitive-files`）にて、`.env` ファイル、各種資格情報（`credentials`, `*.pem`, `*.tfstate`等）、API クライアント環境設定ファイル（`http-client.env.json`, `postman_environment.json`, `insomnia_*.json`）、および AI エージェントの作業履歴（`.claude/`, `.cursor/`, `.aider*` 等）が誤ってステージングされることを明示的にブロックしています。
  - カスタムの `gitleaks` ルール（`.gitleaks.toml`）を導入し、シークレットに加えて PII（個人情報: メールアドレス等）のコミットを明示的に検知・ブロックしています。既知の公開メールアドレスやダミーデータ、CI 関連メールアドレスは Allowlist で安全に除外されます。
  - `actionlint` をローカルフックとして導入し、GitHub Actions ワークフローの構文エラーや式の誤り、シェルインジェクションのリスクなどをコミット前に検出して未然に防ぎます（`pull_request_target` の使用禁止は、ローカルフック `forbid-pull-request-target` および CI の `zizmor.yml` が担当します）。
  - さらに `zizmor` (`zizmor-pre-commit`) をローカルフックとして導入し、GitHub Actions ワークフロー・`.github/dependabot.yml`・`action.yml` の高度なセキュリティミス（`permissions` 過剰、template injection、依存更新ポリシーの不備等）をコミット前に検出します（`known-vulnerable-actions` 等の GitHub API を要するオンライン監査はローカルでは実行されず、CI の `zizmor.yml` が SARIF で補完します）。CI とローカルの監査ルール設定は `.github/zizmor.yml` に一元化しています。
  - `.github/dependabot.yml` の全エコシステムに `cooldown.default-days: 7` を設定し、侵害されたリリースが自動マージされる窓を狭めています（GitHub 既定の 3 日から引き上げ。セキュリティ更新は cooldown の対象外で即時適用されます）。
  - `.gitignore` にて各種シークレットファイルや AI エージェントの作業履歴を除外し、事故を根本から防止。
  - `.gitattributes` にてシークレット関連ファイルの diff 出力を無効化（`-diff`）し、レビュー時の意図しない露出を防止。
  - `.vscode/settings.json` により、AI エージェント（Copilot / Cursor 等）のワークスペース走査からシークレットファイル、パッケージマネージャーの設定ファイル (`.npmrc`, `.yarnrc*`（`.yarnrc.yml` を含む）, `.bunfig.toml`, `bunfig.toml`)、各種証明書・SSH 鍵、クラウドサービスアカウント、各種クラウド構成ディレクトリや IaC 変数 (`*.tfvars`, `*.auto.tfvars`)、およびデータベースのダンプファイル等 (`*.db`, `*.dump`, `*.bak`, `*.sqlite*`, `*.sql`)、HTTP Archive (`*.har`) を除外。

## 2. CI 検知（中央防御層）

PR や Push 時に実行される第二の防御層です。

- **仕組み**: GitHub Actions による継続的なスキャン。
  - **対象ブランチの拡張**: `pre-commit.yml`, `gitleaks.yml`, `trivy.yml`, `trufflehog.yml`, `codeql.yml`, `osv-scanner.yml`, `actionlint.yml`, `zizmor.yml`, および `dependency-review.yml` といった主要なセキュリティスキャンワークフローは、**すべてのブランチ（ワイルドカード `**` を使用）へのプルリクエスト時**に自動実行されるよう構成されています。これにより、フィーチャーブランチから作成されたプルリクエストでもシークレット漏洩や脆弱性を確実に検知・ブロックします。なお `pre-commit.yml`, `gitleaks.yml`, `trivy.yml`, `trufflehog.yml`, `codeql.yml`, `osv-scanner.yml`, `actionlint.yml`, `zizmor.yml` は `push` トリガーも併せ持つため、プルリクエスト作成前のフィーチャーブランチへの push 時点でも検知が働きます。一方 `dependency-review.yml` は `pull_request` トリガーのみで構成されているため、検知はプルリクエスト作成後に限られます。また `actionlint.yml` のみ `paths` フィルタ（`.github/workflows/**` 等）を併用しているため、実行されるのは GitHub Actions 関連ファイルが変更されたプッシュ／PR に限られます。
  - `pre-commit.yml`: ローカルでセットアップ漏れがあった場合や意図的な `--no-verify` によるバイパスを防ぐため、CI 環境上でリポジトリ全体に対して `pre-commit` フックを強制実行します。
  - `gitleaks.yml`: プッシュ時・PR 差分およびスケジュールでリポジトリ全体の履歴をスキャン。
  - `trivy.yml`: ファイルシステムおよび依存関係のシークレット・脆弱性スキャン。
  - `actionlint.yml`: GitHub Actions ワークフローの静的解析および `shellcheck` 連携によるシェルスクリプトの脆弱性（インジェクション等）検知。
  - `zizmor.yml`: GitHub Actions ワークフローに特化したセキュリティ静的解析ツール。`actionlint` よりも踏み込んだ設定ミス（過剰な `permissions`、認証情報の永続化、信頼できない入力の利用など）を検知し、結果を SARIF 形式で GitHub Code Scanning へアップロードします（ジョブレベルで `security-events: write` を付与）。
  - `codeql.yml`: `security-extended` および `security-and-quality` クエリによる高度な脆弱性・コード品質の検知（一部のハードコードされた認証情報パターンも含む）。
  - `dependency-review.yml`: PR で新たに追加・更新される依存パッケージ（OSS）に既知の脆弱性が含まれていないかをスキャン。このワークフローはすべてのプルリクエストに対して実行されます。
  - `osv-scanner.yml`: OSS 依存パッケージの既知脆弱性（OSV データベース照合）をスキャン。「3. 定期監査と自動防御」のスケジュール実行に加え、本拡張によりプッシュ時・PR 時の CI 検知としても動作し、検出結果を SARIF 形式で GitHub Code Scanning へアップロードします（ジョブレベルで `security-events: write` を付与）。
  - `trufflehog.yml`: プッシュ時および PR 時にシークレット検証を実行し、無効化済み・ローテート済みのシークレットも含めた大部分のシークレットパターンの混入をリアルタイムにブロック（例外は後述）。`base`と`head`を省略した場合、アクション側で push は差分コミットのみ、PR はベース〜ヘッドの差分レンジのみが自動的にスキャン対象となり過去コミットの検知は保証されないため、`base: ''` を明示しつつ `head` にコミット SHA を指定することで、毎回の CI 実行時にリポジトリ全履歴および全ファイルの包括的なシークレットスキャンを実施するように拡張されています。
    - **既知の例外（`GoogleGeminiAPIKey` 検出器の除外）**: `trufflehog.yml` の `extra_args` では `--exclude-detectors=GoogleGeminiAPIKey` を指定しています。これは、履歴書き換えコミット `57d12b2`（Firebase 資格情報を履歴から抹消した際のセキュリティ対応コミット）のコミットメッセージに監査目的で記載された、既に GCP 側で無効化済みの Firebase Web API key（`AIzaSy...` 形式）を誤検知するためです。Firebase Web API key は Gemini API key と同じ `AIzaSy...` 形式を共有するため検出器側で区別できません。本プロジェクトは Gemini API キーを CI シークレットとして使用しない方針（`.claude/rules/project.md`）のため実害なく除外できます。ただしこの除外は全履歴スキャンだけでなく、これから積まれる新規コミットにも一律に適用されるため、検知力低下が新規コミットへ波及しないよう、**PR 実行時のみ PR の差分レンジ（base〜head）を全検出器（除外なし）で再スキャンする補完ステップ**を追加しています。誤検知の原因コミット `57d12b2` は通常の PR の base より前に存在するため、この補完ステップで再び誤検知することはありません。この構成でも検知できないのは **push イベント（PR を経由しない直接 push）で新規に混入した `AIzaSy...` 形式キー**のみであり、この形式のキーについては、`gitleaks.yml`（`.gitleaks.toml` の `useDefault=true` により有効化されている `gcp-api-key` ルール）および GitHub Secret Scanning が代替の検出手段として機能します。
- **GitHub Actions 権限の最小化**: すべてのワークフローにおいて Principle of Least Privilege（最小権限の原則）を徹底し、ブラストラジアス（被害範囲）を最小化しています。
  - **トップレベル権限の最小化**: ワークフローのトップレベル `permissions:` は最小化（デフォルトを `contents: read` または `{}` とし、不要な権限を持たせない）しています。
  - **ジョブレベルでの権限付与**: 必要な書き込み・読み取り権限（`security-events: write`, `issues: write`, `pull-requests: write`, `pull-requests: read`, `checks: write`, `actions: read` など）は、各ジョブレベルでのみ明示的に付与しています。さらに、明示的な書き込み権限が不要なジョブであっても、`contents: read` 等の最小限の権限を明示的に定義することで、暗黙的な権限の継承や意図しない動作を防いでいます。
  - **対象ワークフロー**: `hadolint.yml`, `lighthouse.yml`, `markdownlint.yml`, `pre-commit.yml`, `shellcheck.yml`, `trufflehog.yml`, `dependency-review.yml`, `actionlint.yml` をはじめとする全ての CI セキュリティスキャンワークフローにおいて、各ジョブに必要な権限のみを厳密に割り当てています（例外として OSSF Scorecard は `read-all` を許容）。
  - **設定レベルの制限**: なお、GitHub Actions の権限はワークフローレベルまたはジョブレベルでのみ設定可能であり、ステップレベルでは設定できません。
- **pull_request_target の使用禁止（フォークPRからの漏洩防止）**: フォーク元から悪意あるコードが送られた際、`pull_request_target` トリガーはフォークからの PR であってもベースリポジトリのシークレットにアクセスできてしまうため、漏洩の定番経路となります。本リポジトリでは原則として `pull_request_target` の使用を禁止し、安全な `pull_request` トリガーを使用することで、フォーク PR からの意図しないシークレット流出を防ぎます。さらに、ローカルの `pre-commit` フック (`forbid-pull-request-target`) にて、GitHub Actions ワークフローファイルに対する `pull_request_target` の追加を自動的に検知しブロックします。
- **運用上の責任**: CI が落ちた場合、対象のコミットに含まれる漏洩疑いのコードを適切に修正し（必要であればシークレットをローテートし）、マージブロックを解消すること。

## 3. 定期監査と自動防御

継続的な監視と外部からの自動防御機構です。

- **仕組み**:
  - `codeql.yml`, `trivy.yml`, `gitleaks.yml` のスケジュール実行による監査。
  - `osv-scanner.yml` による OSS 脆弱性スキャン。検出された脆弱性は SARIF 形式で GitHub Code Scanning（Advanced Security）へアップロードされ、一元的に可視化・管理されます。
  - `trufflehog.yml` による包括的なシークレット検証（`GoogleGeminiAPIKey` 検出器を除く。除外理由と代替検査は「2. CI 検知」を参照）。PR・Push 時のリアルタイムブロックも含め、毎回リポジトリ全履歴に対してシークレット検証を実施します（スケジュール実行時も同様）。
  - `sbom.yml` による SBOM (Software Bill of Materials) の自動生成と、GitHub Dependency Graph への依存関係の登録（リポジトリの Settings → Security → Code security and analysis から Dependency graph を有効化すること）。
  - GitHub Secret Scanning と Push Protection（リポジトリの Settings → Security → Code security and analysis から必ず有効化すること）。
- **対応**: 過去の履歴に漏洩が検知された場合や、依存パッケージに脆弱性が発見された場合は、すみやかにセキュリティポリシー（`SECURITY.md`）に従って対処すること。

### pre-commit ローカル防御フックの自動最新化

ローカルおよび CI 環境で動作する `pre-commit` フック（`gitleaks` や `trufflehog` など）のシークレット検知ルールを常に最新状態に保つため、定期的な自動更新メカニズムを導入しています。

- `.github/workflows/pre-commit-autoupdate.yml` により、定期的に `pre-commit autoupdate` が実行され、`.pre-commit-config.yaml` に定義されている各種フックのリビジョンを最新に更新する Pull Request が自動作成されます。
- これにより、新たなシークレットパターンへの対応漏れを防ぎ、CI とローカル環境間のバージョン乖離（ドリフト）を解消します。

## 万が一漏洩してしまった場合

シークレットがプッシュされてしまった場合は、**該当のシークレットを直ちに無効化（ローテート）してください**。コミット履歴からの削除（force push 等）だけでは、すでにサードパーティに漏洩しているリスクを排除できません。その後、本ドキュメントや防御設定のギャップを埋める改善を検討してください。

### AIエージェントコンテキストの漏洩防止について

AI エージェントの作業ディレクトリ（`.bolt/`, `.lovable/`, `.devin/`, `.claude/`, `.cursor/`, `.aider*/`, `.continue/`, `.windsurf/`, `.cline/`, `.zeal/` など）は、`.gitignore` で除外されていることに加え、万が一ステージングされた場合でも `.gitattributes` によって diff 出力が無効化（`-diff`）されています。これにより、PR レビュー等の過程でエージェントが保持しているシークレットやプロンプト履歴が意図せず露出することを防ぎます。
さらに、`.vscode/settings.json` を通じて各種 AI アシスタントのワークスペース走査対象からこれらと特定のファイル群（DB ダンプファイルなど）を除外することで、意図しないコンテキストのインジェストや AI 経由の漏洩を未然に防止しています。

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

- `.github/dependabot.yml` にて `npm`, `github-actions`, `docker`, `pip` の依存エコシステムを設定し、最新のパッケージ（特に脆弱性修正が含まれるバージョン）へ自動的に追従できるようにしています。
- `github-actions`, `docker`, `pip` の各エコシステムでは `groups` 設定によりすべてのアップデートが 1 つのプルリクエストにまとめられ、`npm` エコシステムでは密結合な Jest スタックのみがグループ化されています。これにより、監査のノイズを軽減し、重要なセキュリティアップデートの見落としを防ぎます。
- これにより、`docker` で利用するイメージや CI 上のアクション等の防衛層が、脆弱性修正を含む最新バージョンへ追従し、セキュリティ態勢を維持します。なお、シークレット検出パターン自体の更新は Dependabot の対象外であり、gitleaks や trufflehog 等のツールが担当します。
- また、`pip` パッケージについても、`pre-commit` や `detect-secrets` などのローカルおよび CI 上のシークレット検知ツールのバージョンアップに自動追従するよう設定されています。

### 新規追加: IDEワークスペース、OS依存ファイル、およびエディタ一時ファイルの漏洩防止強化

新たに、IDE 固有の設定ファイル（`.idea/`、`.vscode/launch.json`等）、OS 自動生成ファイル（`.DS_Store`等）、および各種エディタの一時ファイル（`*.sw[a-p]`, `*~`等）について、`.gitignore` で未追跡の不要なファイルの追跡開始を防ぎ、`.gitattributes` で diff 出力を無効化し、`.vscode/settings.json` でワークスペースの表示・検索対象から除外し、`.pre-commit-config.yaml` でコミット前にステージング済みファイルをブロックする設定を追加しました。これにより、デバッグ用のローカル環境変数や一時的なシークレットが意図せずコミットされるリスクを未然に防止します。なお vim のスワップファイルは、同一ファイルを 2 つ以上のインスタンスで開くと `.swp` → `.swo` → `.swn` → … と名前がずれていくため、GitHub 公式の `Global/Vim.gitignore` と同じレンジ指定 `*.sw[a-p]` で一括して対象にしています。

### 新規追加: pre-commit ローカル防御フックの厳格化

さらに、意図しない機密情報（AI の作業ディレクトリ、汎用的なシークレットファイル、パッケージマネージャーの設定ファイル、DB のダンプファイル、PII データのエクスポートファイル (`*.csv`, `*.tsv`, `*.xls`, `*.xlsx`, `*.xlsm`, `*.jsonl`, `*.ndjson`)、`*.log`ファイル等の作業ログ）の漏洩を未然に防ぐため、`.pre-commit-config.yaml` にてローカル定義のカスタムフック `forbid-sensitive-files` を追加・強化しました（`repo: local` はフックの定義形式を示すもので、実行自体は `.github/workflows/pre-commit.yml` の `pre-commit run --all-files` により CI 上でも行われます）。これにより、`.gitignore` や `.gitattributes` での漏れがあった場合でも、コミットの段階でステージングを自動的にブロックし、多層的な防御をより強固にしています。

#### 正当なフィクスチャをコミットしたい場合の手順

`*.csv` / `*.tsv` / `*.jsonl` / `*.ndjson` は、テスト用フィクスチャとして正当にコミットしたいケースがあります。このとき **`git add -f` は回避手段になりません**。`git add -f` が無効化するのは `.gitignore` だけで、`pre-commit` はステージング済みのファイルに対して走るため、`files` にマッチした時点でフックは必ず失敗します。

また `git commit --no-verify` は `gitleaks` / `detect-secrets` / `zizmor` を含む**全フックを丸ごと飛ばす**操作であり、最も危険な逃げ道になるため使用しないでください。

正しい手順は、`.pre-commit-config.yaml` の `forbid-sensitive-files` フックの `exclude` に許可パスを追加することです。PII を含まないことを確認したフィクスチャに限り、`test/fixtures/` 配下の `*.csv` / `*.tsv` / `*.jsonl` / `*.ndjson` をあらかじめ許可済みとしています。これ以外のパスを許可する場合は、`exclude` に明示的なパスを追加してレビューを受けてください。

### ライセンスコンプライアンス監査

定期的な監査の一環として、利用している依存パッケージ（OSS）のライセンスコンプライアンス監査を導入しています。

- `.github/workflows/license-compliance.yml` にて、`license-checker` を利用して予期せぬ商用利用不可ライセンス（GPL 等）が混入していないかを確認します。
- このスキャンは、PR 時、プッシュ時、およびスケジュールトリガーにより自動で実行され、法務リスクの低減に寄与します。

### 新規追加: APIクライアント環境設定ファイルの漏洩防止強化

新たに利用される API クライアント（VS Code REST Client, Postman, Insomnia 等）の環境設定ファイル (`http-client.env.json`, `postman_environment.json`, `insomnia_*.json` など）についても、他のツールと同様に `.gitignore`, `.gitattributes`, `.vscode/settings.json`, および `.pre-commit-config.yaml` を用いて、意図しないステージングや diff 出力を防ぐ設定を追加しました。

### 新規追加: クラウド構成ファイルと IaC 変数の漏洩防止強化

各種クラウドプロバイダやホスティングプラットフォームの設定ディレクトリ（`.aws/`, `.kube/`, `.gcp/`, `.azure/`, `.vercel/`, `.netlify/`）や、Terraform 等の IaC ツールで利用される変数ファイル（`*.tfvars`, `*.auto.tfvars`）について、`.gitignore`, `.gitattributes`（`-diff`）, および `.vscode/settings.json` での除外設定を強化しました。さらに、`.pre-commit-config.yaml` のローカル専用カスタムフック `forbid-sensitive-files` においてもこれらのファイルのステージングをブロックするように設定しており、意図しないインフラ情報や認証情報の流出をより強固に防いでいます。

### AIエージェントコンテキストの漏洩防止の追加

新たに利用される AI エージェントの作業ディレクトリ（`.bolt/`, `.lovable/`, `.devin/`, `.roo/`, `.zeal/` 等）についても、他のツールと同様に `.gitignore`, `.gitattributes`, `.vscode/settings.json`, および `.pre-commit-config.yaml` を用いて、意図しないステージングや diff 出力を防ぐ設定を追加しました。

### 新規追加: 異種パッケージマネージャーのロックファイルの混入防止

プロジェクトの標準パッケージマネージャー (Bun) 以外の異種ロックファイル (`package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`, `pnpm-lock.yaml`, `pnpm-lock.yml`) および Yarn Berry の副産物 (`.yarn/`, `.pnp.*`) は `.gitignore` で追跡対象から除外しつつ、`forbid-foreign-lockfiles` カスタムローカルフック (`.pre-commit-config.yaml`) がワークツリー上の実体の有無を毎回検査します。ステージ済みファイルではなくワークツリーを直接検査するため、`.gitignore` によってこれらのファイルがステージされない状態でも、誤って別のパッケージマネージャーで install した痕跡が残っていればコミットをブロックできます。生成そのものは `package.json` の `preinstall` スクリプト (`bunx only-allow bun`) で抑止しています。
