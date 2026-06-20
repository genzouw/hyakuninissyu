# Security Policy

## Reporting a Vulnerability

セキュリティ上の脆弱性を発見された場合は、Issue / PR / Discussion を通じて
**公開**せず、以下のいずれかの非公開チャネルで報告してください。

### 1. GitHub Private Vulnerability Reporting (推奨)

本リポジトリは Private Vulnerability Reporting を有効化しています。

https://github.com/genzouw/hyakuninissyu/security/advisories/new

ログイン済みの GitHub アカウントから上記ページで Advisory を作成いただけます。
やり取りはレポーター・メンテナ間で非公開に保たれます。

### 2. Email

GitHub 経由が難しい場合は以下に直接ご連絡ください。

`genzouw@gmail.com` (件名に `[hyakuninissyu security]` を含めてください)

## What to include

可能な範囲で以下を含めていただけると助かります。

- 影響を受けるバージョン / コミット SHA
- 脆弱性の種類 (例: XSS / 認証バイパス / サプライチェーン etc.)
- 再現手順
- 想定される影響範囲・深刻度の根拠
- PoC やスクリーンショット (任意)

## Response

個人運営のため対応時間に限界がありますが、目安として以下を心がけます。

| ステップ     | 目安                                            |
| ------------ | ----------------------------------------------- |
| 初回応答     | 7 日以内                                        |
| 深刻度の判断 | 14 日以内                                       |
| 修正リリース | Critical/High 30 日以内、それ以外は best-effort |

## Scope

本ポリシーが対象とするのは以下です。

- 本リポジトリのソースコード (このリポジトリの `main` ブランチ)
- 本リポジトリから生成・デプロイされる公開サイト (https://hyakuninissyu.genzouw.com)
- 本リポジトリの GitHub Actions workflow

以下は **対象外** です (該当する場合は当該プロバイダへ報告してください)。

- 利用している npm / GitHub Actions の上流パッケージそのものの脆弱性
  (脆弱なバージョンを本リポジトリが使い続けている場合は対象に含めます)
- ホスティング基盤 (AWS S3 / CloudFront) 自体の脆弱性

## Out of scope (低優先)

- Vue 2 / webpack 3 に既知の脆弱性が残っている件は、本リポジトリが当該
  バージョンを維持している事情と静的サイトとしての影響範囲を考慮し、
  既知のリスクとして受容しています。
  ただし新しい同種脆弱性の報告は引き続き歓迎します。

## Disclosure

修正リリース後、合意の上で Advisory を公開し、報告者の名前 (希望時) を
クレジットに記載します。

## セキュリティ保護と漏洩防止機能 (Security and Leak Prevention)

本リポジトリでは、意図しない認証情報やシークレットの流出を防ぐため、多層的なセキュリティチェックを導入しています。詳細は `docs/security/leak-prevention.md` を参照してください。

リポジトリ管理者は、GitHub のネイティブ機能である **Secret Scanning** と **Push Protection** を有効化することが必須となっています。

- **有効化手順**: リポジトリの `Settings` → `Security` → `Code security and analysis` から、以下の機能を有効（Enable）にしてください。
  - **Secret scanning**
  - **Push protection**

これらの機能により、シークレットがハードコードされたコミットが GitHub にプッシュされる前に自動的にブロックされ、漏洩リスクが大幅に低減されます。
