# Phase 4 Free／Pro権限管理

Phase 4では、Supabaseの `public.entitlements` を権限の正本としてFree／Pro表示を切り替えます。Stripe決済とWebhookはまだ実装しません。

## マイグレーション

Supabase DashboardのSQL Editorで、次のファイルを1回だけ実行します。

```text
supabase/migrations/20260829000100_create_entitlements.sql
```

このマイグレーションは `entitlements` を追加するだけで、`equipment`、`profiles`、localStorageのデータを変更・削除しません。

## 判定ルール

次をすべて満たす場合だけProです。

- `plan = 'pro'`
- `status = 'active'`
- `expires_at` がNULL、または現在時刻より未来

`expires_at = null` は期限なしのProとして扱います。行がない場合、取得中、取得エラー、無効・キャンセル・期限切れ、過去日時の場合はFreeです。

`user_id` は一意なので、同じユーザーのentitlementsが複数存在することはありません。

## RLSとクライアント権限

- ログインユーザーは本人の行だけSELECTできます。
- `authenticated` にはINSERT、UPDATE、DELETEを付与しません。
- INSERT、UPDATE、DELETE用のRLSポリシーも作成しません。
- Publishable keyを使うブラウザからPro権限を変更できません。
- Secret key、Service Role keyはフロントエンドへ配置しません。

管理者のSQL Editor操作、または将来の信頼できるStripe Webhookだけが権限を更新します。

## ユーザーIDを確認する

Supabase DashboardのAuthentication > Usersで対象ユーザーを開き、User UIDを確認します。SQL Editorでは次でも確認できます。

```sql
select id, email, created_at
from auth.users
order by created_at desc;
```

実際のUser UIDをソースコードやGit管理ファイルへ書かないでください。

## 手動でProを付与する

`TARGET_USER_ID`を実際のUser UIDへ置き換え、SQL Editorで実行します。

```sql
insert into public.entitlements
  (user_id, plan, status, source, expires_at)
values
  ('TARGET_USER_ID'::uuid, 'pro', 'active', 'manual', null)
on conflict (user_id) do update
set plan = excluded.plan,
    status = excluded.status,
    source = excluded.source,
    expires_at = excluded.expires_at,
    updated_at = now();
```

実行後、アプリを再読み込みするとPro表示になります。

## Freeへ戻す

履歴を残して無効化するため、行を削除せずFree／inactiveへ更新します。

```sql
update public.entitlements
set plan = 'free',
    status = 'inactive',
    source = 'manual',
    expires_at = null,
    updated_at = now()
where user_id = 'TARGET_USER_ID'::uuid;
```

実行後、アプリを再読み込みします。用品データは削除されません。

## 期限付きProを設定する

次は実行時点から30日間だけProにする例です。

```sql
insert into public.entitlements
  (user_id, plan, status, source, expires_at)
values
  ('TARGET_USER_ID'::uuid, 'pro', 'active', 'manual', now() + interval '30 days')
on conflict (user_id) do update
set plan = excluded.plan,
    status = excluded.status,
    source = excluded.source,
    expires_at = excluded.expires_at,
    updated_at = now();
```

期限を過ぎるとアプリはFreeとして扱います。データベース行は監査・将来の決済連携のため保持します。

## Phase 4の機能区分

Freeで利用可能：用品CRUD、基本一覧、文字検索、並び替え、基本集計、JSONバックアップ・復元、localStorage保存。

Pro限定：詳細分析、CSV出力、カテゴリ・メーカー・ステータスの高度な絞り込み、localStorageからSupabaseへの移行、将来の広告非表示判定。

クラウド保存は既存利用者のデータを不可視化しないため、移行期間中はログイン済みFreeユーザーも継続利用できます。完全なPro限定化はStripeとWebhookを導入し、既存ユーザーの移行方法を確定してから行います。

## Cloudflare Pages

新しい環境変数はありません。既存の `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` をそのまま利用します。マイグレーション適用後にアプリをデプロイしてください。
