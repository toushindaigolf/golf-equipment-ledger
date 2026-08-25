# Supabase Phase 3-1 適用手順

Phase 3-1はデータベースとRLSだけを追加します。Reactアプリはまだ `public.equipment` を読み書きせず、用品データの保存先は引き続きlocalStorageです。

## 作成されるテーブル

`public.profiles`

- `user_id`: `auth.users.id`を参照する主キー。ユーザー削除時に連動削除
- `created_at`、`updated_at`: 作成・更新日時

`public.equipment`

- `id`: 現在の文字列IDを保持できる主キー
- `user_id`: 所有者。`auth.users.id`を参照し、必須
- `name`、`category_id`、`manufacturer`
- `purchase_date`、`purchase_price`、`purchase_place`、`purchase_reason`
- `sale_price`、`sale_date`
- `status`、`memo`
- `created_at`、`updated_at`

金額は現在の入力仕様に合わせて0以上の整数、ステータスは `in_use`、`stored`、`sold` のいずれかに制限します。`updated_at` は更新トリガーで自動更新します。

## 適用方法

推奨はSupabase CLIでマイグレーション履歴を管理する方法です。

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

CLIをまだ導入しない場合は、Supabase DashboardのSQL Editorで `supabase/migrations/20260826000100_create_profiles_and_equipment.sql` の内容を1回だけ実行できます。その場合も、実行済みのマイグレーションファイルはGitで保持してください。

既存のPhase 2ユーザーにはマイグレーション内でプロフィールを作成します。以後の新規ユーザーには `on_auth_user_created` トリガーがプロフィールを自動作成します。

## RLSと権限

両テーブルでRLSを有効化し、`anon` と `authenticated` の既定権限をいったんすべて剥奪します。その後、`authenticated` にだけSELECT・INSERT・UPDATE・DELETEを許可し、各操作を個別の所有者ポリシーで制限します。

- SELECT: 自分の行だけ取得可能
- INSERT: `user_id`が自分の場合だけ作成可能
- UPDATE: 自分の既存行だけを、自分の所有行として更新可能
- DELETE: 自分の行だけ削除可能

すべての判定はデータベース内の `(select auth.uid()) = user_id` で行います。未ログインのAnon Key利用者にはテーブル権限自体がありません。Service Role KeyはRLSを回避できるため、フロントエンドへ配置しないでください。

## データベーステスト

DockerとSupabase CLIを利用できる環境では、次を実行します。

```powershell
npx supabase start
npx supabase db reset
npx supabase test db
```

`supabase/tests/database/equipment_rls.test.sql` は、RLS有効化、ポリシー一覧、Anon拒否、本人データだけのSELECT、他人名義のINSERT拒否、本人UPDATE、他人データDELETE拒否を確認します。

## Phase 3-1で行わないこと

- localStorageからの移行
- Supabaseへの用品保存
- 自動同期、競合解決
- Pro権限、決済、Stripe、Webhook
- TypeScriptのSupabase Database型生成

これらはDB適用とRLSテストの成功を確認してから、次のPhaseで個別に実装します。
