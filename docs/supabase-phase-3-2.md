# Supabase Phase 3-2 クラウド保存

Phase 3-2では、認証状態に応じて用品データの保存先を切り替えます。

- 未ログイン、またはSupabase未設定: 既存の `golf-equipment-ledger-v1` を使うlocalStorage保存
- ログイン済み: `public.equipment` を使うSupabase保存

ログイン前に端末へ保存した用品は、自動でクラウドへ移行しません。ログインとログアウトでも端末内データは削除しません。ログイン中のJSON復元はデータ移行に相当するため、このPhaseでは無効です。JSONバックアップとCSV出力は、現在画面で利用している保存先の全用品を対象にします。

## 事前準備

1. [`supabase-phase-3-1.md`](supabase-phase-3-1.md) の手順でマイグレーションを適用する
2. Cloudflare PagesのProductionとPreviewに次を登録する

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Service Role Keyは使用しません。ブラウザからは公開可能なキーとログインセッションを利用し、データ所有者の制限はRLSで強制します。

## 動作確認

1. ログアウト状態で用品を登録し、再読み込み後も端末内に残ることを確認する
2. ログインし、「クラウド保存」と表示され、端末内の用品が自動表示されないことを確認する
3. ログイン中に登録・編集・削除し、再読み込み後も結果が残ることを確認する
4. ログアウトし、クラウド用品ではなく端末内用品へ表示が戻ることを確認する
5. 別ユーザーでログインし、先のユーザーの用品が表示・変更できないことを確認する

通信やSupabaseでエラーが起きた場合、画面上の既存一覧は維持されます。失敗した登録・編集・削除をlocalStorageへ自動保存したり、オフライン同期キューへ追加したりはしません。

## 今回含まないもの

- localStorageからSupabaseへの移行
- 自動同期、オフラインキュー、競合解決
- Pro権限および決済
- ログイン中のJSON復元
