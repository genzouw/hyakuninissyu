# AGENTS.md — AI コーディングエージェント向けポリシー

本ドキュメントは、自律型コーディングエージェント (Jules / Devin / Codex / Sweep / Aider / Cursor Composer / Claude Code / GitHub Copilot Workspace 等) が、公開 OSS リポジトリ [`genzouw/hyakuninissyu`](https://github.com/genzouw/hyakuninissyu) で Pull Request を作成するときに **必ず守るべき規範** を定義します。
キーワードの解釈は [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt) ([日本語訳](https://www.ipa.go.jp/security/rfc/RFC2119JA.html)) に従います (MUST / MUST NOT / SHOULD / SHOULD NOT / MAY)。

このファイルは [agents.md 規格](https://agents.md/) に従って配置しています。Jules や Codex などの主要エージェントは、このファイルをリポジトリルートから自動的に読み込み、エージェントとしての振る舞いに反映します。

---

## 1. 最重要原則: 公開 OSS で完全無料のサービスのみを利用する

本リポジトリの CI/CD では、**公開 OSS リポジトリ向けに「完全無料で利用可能」なサービスのみ** を利用します。
「完全無料」の定義は、以下のすべてを満たすことです。

1. 公開 OSS リポジトリ (パブリックな GitHub リポジトリ) で利用する場合に、課金が一切発生しないこと
2. 利用にあたって従量課金 API キー / トークンを必要としないこと
3. 利用量・レート制限・期間制限を超えた瞬間に課金が始まる "無料枠" 型でないこと
4. 有料プラン / 有料ライセンス / 有料トライアル / シート課金を必要としないこと

上記をひとつでも満たさないサービスを CI に組み込む PR は **MUST NOT** で、提出された場合は自動的にクローズされます。

### 1.1 MUST NOT — これらを含む PR は問答無用でクローズされます

- **MUST NOT**: LLM プロバイダの API キー / トークンを GitHub Secrets に登録し、CI ワークフロー / GitHub Action から呼び出す構成の追加。
  - 該当する API キー例 (これらに限らない):
    - `OPENAI_API_KEY`, `OPENAI_API_BASE_URL`
    - `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`
    - `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`
    - `MISTRAL_API_KEY`, `COHERE_API_KEY`, `GROQ_API_KEY`
    - `DEEPSEEK_API_KEY`, `PERPLEXITY_API_KEY`, `XAI_API_KEY`, `TOGETHER_API_KEY`
    - `HUGGINGFACE_API_TOKEN` (推論 API として使う場合)
  - **「無料枠内に収まる前提」での利用も MUST NOT です**。レート制限到達時に課金が始まる構造そのものを禁止します。
  - **OpenAI 互換エンドポイント経由 (`OPENAI_API_BASE_URL` を Gemini や DeepSeek 等に向けるパターン) も同じく MUST NOT** です。鍵の名称ではなく「課金可能な API へ繋がる鍵を登録する行為」を禁止しています。
- **MUST NOT**: 有料プラン / 有料ライセンス / 有料トライアル / クレジットカード登録を必要とするサービスの CI 組み込み。
- **MUST NOT**: 公開 OSS リポジトリでも Pro プラン以上を要求する SaaS の追加。
- **MUST NOT**: 既に本リポジトリに導入済みのツールと機能が重複する追加 (§2 「既に動いているツール」を参照)。
- **MUST NOT**: リポジトリオーナーに新規 Secret の発行・登録を依頼する PR (OIDC / 公開鍵証明を用いず、人手で鍵を回す構成のもの)。
- **MUST NOT**: 既存テスト / lint / セキュリティスキャンをスキップ / 無効化 / コメントアウトして提出すること。
- **MUST NOT**: パッケージマネージャを `npm` / `yarn` / `pnpm` に変更したり、それらの CLI を CI / `package.json` の `scripts` に追加すること。本リポジトリは **Bun のみ** を使います。
- **MUST NOT**: サードパーティ GitHub Action をタグ参照 (`@v1` 等) のみで導入すること。**フルコミット SHA で pin** してください (`zizmor` がブロックします)。

### 1.2 SHOULD — 強く推奨される慣行

- **SHOULD**: 公式 (GitHub / OpenSSF / 主要 OSS 組織) または Verified creator の発行元から提供される GitHub Action / GitHub App を優先する。
- **SHOULD**: 新規 Action を追加する際は、`zizmor` / `actionlint` で警告が出ない構成にする。
- **SHOULD**: ワークフローの `permissions:` は最小権限から始める (`contents: read` を既定とし、必要なジョブで個別に書込権限を付与)。
- **SHOULD**: ワークフローに `concurrency:` を設定し、同一 PR / ref への多重起動を抑止する。
- **SHOULD**: PR を作成する前に、判断に迷う場合は Issue でリポジトリオーナー (@genzouw) に相談する。

### 1.3 MAY — 採用してよい構成

- **MAY**: GitHub Marketplace の「公開 OSS リポジトリ向け完全無料プラン」で提供される Action / App。
- **MAY**: GitHub App の「公開 OSS リポジトリ向け完全無料枠」で、API キーの登録が不要なもの (例: CodeRabbit / Qodo Merge / Gemini Code Assist の OSS 無料枠)。
- **MAY**: 完全無料で配布されている GitHub Action (Marketplace 登録の有無は問わない)。
- **MAY**: ローカル LLM (Ollama / llama.cpp 等) を GitHub-hosted runner 上で動作させる、Secrets 不要の自動化。
- **MAY**: リポジトリ内で完結する Shell スクリプト / Bun スクリプト / Make ターゲット (外部 SaaS 連携を伴わないもの)。
- **MAY**: 既存ワークフローのキャッシュ最適化、並列化、`oven-sh/setup-bun` の最新化、`actions/*` の SHA pin 更新といった、課金を伴わない構造改善。

---

## 2. 既に動いているツール (重複 PR を作らないこと)

本リポジトリで既に有効化されている AI / 品質 / セキュリティ / リリース系の自動化です。これらと機能が重複する PR は **MUST NOT** で提出してください。詳細は `.github/workflows/` 配下の YAML と各設定ファイルを参照してください。

| 種別                    | ツール / 設定ファイル                                                                                               | 役割                                                                  |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| AI コードレビュー       | [CodeRabbit](https://github.com/apps/coderabbitai) (`.coderabbit.yaml`)                                             | プルリクエストの AI レビュー                                          |
| AI コードレビュー       | [Qodo Merge (旧 PR-Agent)](https://github.com/apps/qodo-merge) (`.pr_agent.toml`, `.github/workflows/pr-agent.yml`) | PR スコアリング / 自動要約 / `/review` 等のコメントコマンド           |
| LLM コンテキスト生成    | Repomix (`.github/workflows/repomix.yml`, `repomix.config.json`, `static/llms.txt`)                                 | `llms.txt` 規格の XML / Markdown 自動生成と `ai-context` ブランチ公開 |
| セキュリティスキャン    | CodeQL (`.github/workflows/codeql.yml`)                                                                             | GitHub 公式の SAST                                                    |
| セキュリティスキャン    | Gitleaks (`.github/workflows/gitleaks.yml`, `.gitleaks.toml`)                                                       | コミット内シークレット検知                                            |
| セキュリティスキャン    | TruffleHog (`.github/workflows/trufflehog.yml`)                                                                     | コミット履歴のシークレット検知                                        |
| セキュリティスキャン    | Trivy (`.github/workflows/trivy.yml`)                                                                               | 依存パッケージ / IaC / コンテナ脆弱性スキャン                         |
| セキュリティスキャン    | OSV-Scanner (`.github/workflows/osv-scanner.yml`)                                                                   | 依存パッケージの既知脆弱性スキャン                                    |
| セキュリティスキャン    | zizmor (`.github/workflows/zizmor.yml`)                                                                             | GitHub Actions ワークフローの脆弱性監査                               |
| セキュリティスキャン    | Dependency Review (`.github/workflows/dependency-review.yml`)                                                       | PR で導入される依存の脆弱性差分レビュー                               |
| 機密ファイル検知        | pre-commit (`.pre-commit-config.yaml`, `.github/workflows/pre-commit.yml`, `.secrets.baseline`)                     | コミット前ローカル検査 + CI での再検査                                |
| 供給網健全性            | Scorecard (`.github/workflows/scorecard.yml`), SBOM (`.github/workflows/sbom.yml`)                                  | OpenSSF Scorecard / SBOM 生成                                         |
| Lint                    | ESLint (`eslint.config.js`)                                                                                         | JavaScript / Vue の静的検査                                           |
| Lint                    | Prettier (`.prettierrc`)                                                                                            | コード整形                                                            |
| Lint                    | actionlint (`.github/workflows/actionlint.yml`)                                                                     | GitHub Actions ワークフローの構文チェック                             |
| Lint                    | markdownlint-cli2 (`.github/workflows/markdownlint.yml`, `.markdownlint-cli2.jsonc`)                                | Markdown の構文チェック                                               |
| Lint                    | commitlint (`commitlint.config.js`, `.husky/`)                                                                      | Conventional Commits 準拠検証                                         |
| 性能 / アクセシビリティ | Lighthouse CI (`.github/workflows/lighthouse.yml`)                                                                  | Web パフォーマンス / アクセシビリティ計測                             |
| リリース管理            | Release Drafter (`.github/workflows/release-drafter.yml`, `.github/release-drafter.yml`)                            | リリースノート自動生成                                                |
| リリース管理            | Semantic PR (`.github/workflows/semantic-pr.yml`)                                                                   | PR タイトルの Conventional Commits 準拠検証                           |
| 依存更新                | Dependabot (`.github/dependabot.yml`, `.github/workflows/dependabot-auto-merge.yml`)                                | 依存パッケージ自動更新と auto-merge                                   |
| その他                  | stale (`.github/workflows/stale.yml`), PR conflict notifier (`.github/workflows/pr_conflict_notify.yml`)            | Issue / PR の自動クローズ通知、コンフリクト通知                       |

特に以下の領域は既に十分に網羅されているため、新規追加の PR は不要です。

- **AI コードレビュー / AI コード補助**: CodeRabbit / Qodo Merge / Gemini Code Assist の 3 系統が稼働中。Gemini / OpenAI / Claude 等の API キーを使う追加 AI コードレビュー Action は **MUST NOT**。
- **シークレット検知**: Gitleaks / TruffleHog / pre-commit + detect-secrets の 3 重化で十分。GitGuardian 等の追加 SaaS は不要。
- **依存脆弱性スキャン**: Trivy / OSV-Scanner / Dependency Review / Dependabot の 4 重化で十分。Snyk 等の追加 SaaS は不要。

---

## 3. PR を作成する前のチェックリスト (MUST すべて満たす)

PR を提出する前に、以下のチェックリストを **MUST すべて** 満たしてください。ひとつでも欠けている PR は自動的にクローズされます。

- [ ] 追加するサービスが「公開 OSS リポジトリで完全無料で利用可能」であることを、**公式の料金ページ / ドキュメントの URL** で証明している。
- [ ] 追加するサービスが §2「既に動いているツール」と機能重複していないことを確認した。
- [ ] LLM プロバイダの API キー / 従量課金 API キーを GitHub Secrets に追加していない。`OPENAI_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` 等を `secrets.*` から参照する記述が新規ファイルに含まれていない。
- [ ] 「無料枠内に収まる前提」の利用ではなく、「課金が一切発生しない構成」であることを PR 本文に明記している。
- [ ] 追加する GitHub Action は **フルコミット SHA で pin** している (`@v1` 等のタグ参照は禁止)。
- [ ] Node.js / npm / yarn / pnpm のセットアップを増やしていない。Bun (`oven-sh/setup-bun`) を使っている。
- [ ] 既存テスト / lint / セキュリティスキャンをスキップ・削除していない。
- [ ] ローカルで `bun install` → `bun run lint` → `bun run unit` → `bun run build` が通る。
- [ ] UI / アセット変更を含む場合、Lighthouse スコア (パフォーマンス / アクセシビリティ) が悪化していない。

## 4. PR 本文に必ず含めるべき情報

PR 説明文には以下のセクションを **MUST** で含めてください。**日本語で** 記載してください。

1. **目的**: この変更で何を改善したいか (1〜3 文)。
2. **導入する/変更するもの**: 追加・更新・削除するワークフロー / 設定ファイル / アクションの一覧。
3. **「公開 OSS で完全無料」の証明**: 公式の料金ページ URL と、無料で利用できる条件の引用。
4. **既存ツールとの重複がないことの確認**: §2 の表との対比と、機能が重複しない理由。
5. **マージ前に必要な手動セットアップ手順**: §5 の節に従って詳細に記載する。
6. **想定リスクとロールバック手順**: 何が壊れる可能性があり、どう戻すか。`main` への直接コミット禁止ポリシー (pre-commit でブロック) との整合性も明記する。
7. **動作確認結果**: ローカルで実行したコマンド (`bun run lint` 等) とその結果。CI 上で確認すべき点があれば併記。

## 5. マージ前に必要な手動セットアップ手順の書き方 (MUST)

GitHub App の有効化、Marketplace App のインストール、ブランチ保護ルールの更新、リポジトリ設定の変更、AWS S3 / CloudFront 関連の設定変更などは、PR をマージしても自動では適用されません。エージェントが PR を作成する際は、以下を **マージ前作業 (Manual Pre-merge Setup)** として PR 説明文に含めてください。

- 手順は **番号付きの手順書** で書くこと (リポジトリオーナーがそのまま実行できる粒度)。
- 各手順について、操作する URL (例: `https://github.com/apps/<app-name>` や `https://github.com/genzouw/hyakuninissyu/settings/installations`) を併記すること。
- 完全無料で済むことを示すため、有料プラン選択画面が出る場合の **回避手順** を必ず書くこと。
- セットアップ完了の確認方法 (例: 該当 Action が初回 PR でグリーンになることを確認、`ai-context` ブランチが更新されることを確認、など) を書くこと。
- AWS 側 (S3 / CloudFront / Route53 / OIDC) に影響する変更を含む場合は、ロールバック時の手順 (旧構成への切り戻し方) も書くこと。

---

## 6. 例外申請プロセス (SHOULD)

上記ポリシーから外れる導入をどうしても検討したい場合は、PR を作成する **前に** Issue で提案し、リポジトリオーナー (@genzouw) の明示的な承認を **SHOULD** 取得してください。承認のない有料サービス導入 PR は自動的にクローズされます。
Issue では「なぜ既存の無料サービスでは目的を達成できないか」「課金リスクをどう管理するか」を明確に書いてください。

「とりあえず PR を作って判断してもらう」というアプローチは取らないでください。レビューコストが発生し、結果として全員の生産性を下げます。

---

## 7. 本リポジトリ固有の注意事項

エージェントは以下の固有事情を **MUST** で守ってください。

- **パッケージマネージャ**: Bun のみ。`package.json` の `scripts` は `bun run <cmd>` で実行する。
- **webpack 起動時の環境変数**: `NODE_OPTIONS=--openssl-legacy-provider` が必須 (`bun run build` / `bun run dev`)。CI で `bun run build` を新規追加する場合も同様。
- **GA 計測タグ ID**: `process.env.GA_ID` は webpack DefinePlugin で静的に埋め込まれる (未設定時は `null`)。Secrets での管理は不要。
- **ルーティング**: パラメータをパスに埋め込む形 (`/playing/:countOfQuestions`、`/gameSet/:countOfQuestions/:score`、`/time-attack-result/:timeMs/:score`、`/ai-battle-result/:playerScore/:aiScore/:totalQuestions/:difficulty`、`/daily-challenge-result/:score/:streak/:previousStreak/:newlyCollectedCount?` 等)。新規ルートを追加する場合はこの形式に揃える。
- **永続化**: `localStorage` のキーは `dailyChallengeLastCompleted` / `dailyChallengeStreak` / `collectedPoemIds` 等が既に使われている。新キーを追加する際は衝突を避ける。
- **TTS**: 音声合成は `src/composables/useSpeech.js` の `enableSpeak` / `speakText` インターフェース経由で利用する。`speechSynthesis.cancel()` に引数を渡してはいけない。
- **スタイリング**: Bootstrap 5 のユーティリティクラス (`ms-*`, `me-*` 等) を使う。Bootstrap 4 の非推奨クラス (`ml-*`, `mr-*`) を新規追加してはいけない。
- **外部リンク**: `<a target="_blank">` を新設する際は `rel="noopener noreferrer"` を必ず付与する。
- **モジュール定数の不変性**: モジュールスコープの定数を破壊的に変更してはいけない (`map` とスプレッド演算子などで新しいオブジェクトを作る)。
- **デプロイ**: 静的サイトは AWS S3 + CloudFront へ GitHub Actions (`oven-sh/setup-bun` 利用) でデプロイ。`.github/workflows/deploy.yml` の変更は影響範囲が大きいため、別 PR に分離し、`workflow_dispatch` での手動検証手順を PR 本文に書く。
- **main への直接コミット禁止**: `main` / `master` への直接コミットは pre-commit フックでブロックされる。必ずトピックブランチを切る。

---

## 8. 情報源の扱い

最新情報を調査する際は、以下の優先度で確認してください。

- 一次情報 (公式ドキュメント / GitHub Marketplace の料金プラン / 公式ブログ) を最優先する。
- セカンダリ情報 (Hacker News / Reddit / Zenn / Qiita / 技術系 Substack / dev.to) は背景把握に使い、PR 本文の根拠としては引用しない。
- 古い情報 (1 年以上前のブログ等) を根拠にしない。料金体系は変わりやすいため、公式ページで最終確認する。

## 9. 言語規約

- PR タイトル、PR 説明文、コミットメッセージ、ソースコード内コメント、ドキュメントは **日本語** で記載する。
- 技術用語 (GitHub Actions / CI/CD / API キー / Marketplace / Bun / Vue 等) は原語のままでよい。
- コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従う (例: `ci: <変更内容>`, `docs: <変更内容>`, `feat(ci): <変更内容>`, `chore(security): <変更内容>`)。本リポジトリの直近コミットにならい、`chore(security): 🔒 ...` のような絵文字付きスコープも歓迎する。

## 10. 判断に迷ったときのフローチャート

迷ったら次の順番で安全側に倒してください。

1. 課金が一切発生しないことに 100% の確信が持てない → PR を作らずに Issue で提案する。
2. 既存ツールと重複しているか判断できない → PR を作らずに Issue で提案する。
3. 必要な Secrets / 権限がある → PR を作らずに Issue で提案する。
4. 本番デプロイ (`deploy.yml`) や S3 / CloudFront に影響する → PR を作らずに Issue で提案する。

---

## 11. 過去のポリシー違反 PR の参考

以下は本ポリシー違反として **クローズ済み** の代表例です。エージェントは類似の PR を作成しないでください。

- [PR #281](https://github.com/genzouw/hyakuninissyu/pull/281) — Gemini API キー (`OPENAI_API_KEY` を Google AI Studio で発行した鍵に向ける構成) を Secrets に要求する `zxcloli666/AI-Code-Review` Action の追加。従量課金型 API キー依存 + AI コードレビュー機能重複の二重ポリシー違反。

---

## 12. 関連ドキュメント

- [`CLAUDE.md`](./CLAUDE.md) — Claude Code / 一般的な AI エージェント向け規範 (本リポジトリ版)
- [`.claude/rules/project.md`](./.claude/rules/project.md) — プロジェクト固有ルール (Bun 限定 / 無料サービス限定 等)
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) — GitHub Copilot 向け指示
- [`docs/agents/jules-prompt.md`](./docs/agents/jules-prompt.md) — Jules に貼り付ける詳細版プロンプト (本ファイルの拡張版)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — コントリビューションガイド
- [`SECURITY.md`](./SECURITY.md) — セキュリティポリシー
- [`docs/security/leak-prevention.md`](./docs/security/leak-prevention.md) — 漏洩防止の多層防御
