# 環境構成一覧

| 項目 | 本番 | ステージング | ローカル |
| --- | --- | --- | --- |
| Gitブランチ | `main` | `staging` | 作業目的に応じて`staging` |
| アプリURL | `https://golf-equipment-ledger.pages.dev/` | Cloudflareの`staging`固定Preview URL | `http://localhost:5173/` |
| Cloudflare | Production | Preview | 使用しない |
| `VITE_APP_ENV` | `production` | `staging` | `local` |
| Supabase | 本番専用プロジェクト | テスト専用プロジェクト | 原則テスト専用プロジェクト |
| 用品データ | 本番ユーザーのデータ | テストデータのみ | 端末内またはテストデータのみ |
| 認証ユーザー | 本番ユーザー | テスト専用ユーザー | テスト専用ユーザー |
| Free／Pro | 本番`entitlements` | テスト用`entitlements` | テスト用`entitlements` |
| 問い合わせ | 本番Googleフォーム | テストGoogleフォームまたは明示的なテスト運用 | 未設定またはテストフォーム |
| Stripe | 未実装 | 今回は未設定。将来Test Mode | 今回は未設定 |
| 環境バナー | 非表示 | `STAGING｜テスト環境` | 非表示 |

## 共通の環境変数名

```env
VITE_APP_ENV=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CONTACT_FORM_URL=
```

値は環境ごとに分けます。Secret key、Service Role key、Stripe Secret Keyは、いずれのフロントエンド環境にも設定しません。

環境変数が未設定の場合、Supabaseクライアントは作成されず、既存の端末内保存機能を利用できます。`VITE_APP_ENV`が未設定または不正な値の場合は安全側としてproduction表示になり、STAGINGバナーは表示されません。

