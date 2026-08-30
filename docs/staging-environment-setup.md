# ステージング環境セットアップ

## 目的

`staging`は、認証、クラウド保存、Free／Pro権限、RLS、端末内データ移行、将来のStripe Test Modeを、本番ユーザーと本番データに触れず確認する環境です。

本番とステージングでは、Gitブランチ、Cloudflare Pagesのデプロイ区分、Supabaseプロジェクト、ユーザー、用品データ、問い合わせ先を分離します。本番データはコピーしません。

## ブランチ運用

- `main`へのPushはProductionデプロイ対象です。
- `staging`へのPushはPreviewデプロイ対象です。
- 開発と検証は`staging`で行い、確認済みの変更だけを別途レビューして`main`へ反映します。
- このセットアップ作業では、コミット、Push、マージ、本番デプロイを自動実行しません。

作業開始時は次を確認します。

```powershell
git switch staging
git pull --ff-only
git status
```

## テスト用Supabaseプロジェクト

Supabase Dashboardで本番とは別のプロジェクトを作成します。Tokyoリージョンを選択し、プロジェクト名にも`staging`または`test`を含めてください。

テスト用プロジェクトには次のものだけを準備します。

- テーブル、関数、トリガー、インデックス、RLSポリシー
- テスト専用アカウント
- テスト専用用品データ
- テスト専用Free／Pro権限

本番のユーザー、用品データ、認証情報、entitlementsはコピーしません。フロントエンドに設定するのはテスト用Project URLとPublishable keyだけです。Secret key、Service Role key、データベースパスワードは設定しません。

## マイグレーション適用順

テスト用SupabaseのSQL Editorで、次の順番に各ファイルを1回ずつ実行します。

1. `supabase/migrations/20260826000100_create_profiles_and_equipment.sql`
2. `supabase/migrations/20260827000100_add_equipment_source_id.sql`
3. `supabase/migrations/20260829000100_create_entitlements.sql`

これにより、`profiles`、`equipment`、`source_id`、`entitlements`、インデックス、更新日時トリガー、RLSが作成されます。テスト用プロジェクトが空であることを確認してから実行してください。

適用後はSQL EditorでRLSが有効であることを確認し、`supabase/tests/database/equipment_rls.test.sql`と`supabase/tests/database/entitlements_rls.test.sql`の確認項目をテスト用ユーザーで検証します。

## Supabase Auth設定

AuthenticationのEmail providerを有効にします。本番相当の確認を行う場合は、Confirm emailも有効にします。

URL Configurationには実際に利用するURLだけを登録します。

- Site URL：Cloudflare Pagesで生成された`staging`ブランチの固定Preview URL
- Redirect URLs：同じ固定Preview URLと`http://localhost:5173/`
- 本番URL：本番Supabase側だけに`https://golf-equipment-ledger.pages.dev/`を設定

Cloudflareが発行するPreview URLはデプロイ後に画面で確認してください。コミットごとに変わる一時URLではなく、可能であれば`staging`ブランチ用の固定エイリアスを使用します。不必要に広いワイルドカードは登録しません。

## Cloudflare Pages Preview設定

既存のPagesプロジェクトを使用します。新しい本番プロジェクトは作成しません。

PagesプロジェクトのSettingsから、Preview環境だけに次を設定します。

```env
VITE_APP_ENV=staging
VITE_SUPABASE_URL=テスト用SupabaseのProject URL
VITE_SUPABASE_ANON_KEY=テスト用PublishableまたはAnon Key
VITE_CONTACT_FORM_URL=テスト用Googleフォームの公開URL
```

Build commandは`npm run build`、Build output directoryは`dist`です。Production側の既存変数は変更しません。設定後、`staging`のPreviewだけを再デプロイします。

画面上部に`STAGING｜テスト環境`が表示されることを確認します。本番URLでは表示されないことも確認してください。

## 問い合わせフォーム

Preview環境の`VITE_CONTACT_FORM_URL`にはテスト専用フォームを推奨します。本番フォームを一時的に使う場合は、回答の先頭へ`[STAGING TEST]`と記載する運用を決め、公開前に混在がないことを確認してください。

URLは環境変数だけに設定し、ソースコードやテストコードへ実URLを書きません。

## テストアカウントとテストデータ

受信確認できるテスト専用メールアドレスを2つ用意し、Free確認用とPro確認用に分けます。個人の普段使いメールアドレスや実際の購入履歴は使用しません。

用品名には`STAGING TEST ドライバー`など、テストデータと分かる名前を使用します。

テスト用Pro権限は、テスト用SupabaseのSQL Editorだけで付与します。

```sql
insert into public.entitlements
  (user_id, plan, status, source, expires_at)
values
  ('TEST_USER_ID'::uuid, 'pro', 'active', 'manual', null)
on conflict (user_id) do update
set plan = excluded.plan,
    status = excluded.status,
    source = excluded.source,
    expires_at = excluded.expires_at,
    updated_at = now();
```

`TEST_USER_ID`はテスト用SupabaseのAuthentication画面で確認したUIDへ置き換えます。実UIDをGit管理ファイルへ記録しません。

Freeへ戻すときは、テスト用Supabaseで次を実行します。

```sql
update public.entitlements
set plan = 'free',
    status = 'inactive',
    source = 'manual',
    expires_at = null,
    updated_at = now()
where user_id = 'TEST_USER_ID'::uuid;
```

## 誤接続防止の確認

1. URLが`staging`用Preview URLであることを確認します。
2. 画面上部の`STAGING｜テスト環境`を確認します。
3. Supabase Dashboardでテスト用プロジェクト名を確認します。
4. Preview環境変数のProject URLがテスト用Project Refを含むことを、値を公開せず確認します。
5. テストユーザーとテスト用品が本番Supabaseに存在しないことを確認します。
6. 本番URLにSTAGINGバナーが表示されないことを確認します。

Stripeは今回設定しません。Phase 5では、このPreview環境とテスト用SupabaseをStripe Test Modeの接続先として使用します。

