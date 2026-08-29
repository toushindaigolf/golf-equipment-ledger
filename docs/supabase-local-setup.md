# Supabaseローカル接続設定

この手順はローカル開発環境専用です。Cloudflare Pagesの環境変数はまだ変更しません。

## 使用する環境変数

現在のコードは次の2つを参照します。

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

`VITE_SUPABASE_ANON_KEY` は既存コードとの互換性を保つための名前です。値にはSupabaseのPublishable key（`sb_publishable_...`）を設定できます。

Viteでは `VITE_` から始まる値がブラウザへ組み込まれます。このファイルにはPublishable keyだけを設定し、Secret key、Service Role key、データベースパスワードは設定しないでください。

## PowerShellで設定する

プロジェクトのルートディレクトリで次を実行します。

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

開いた `.env.local` のプレースホルダーを、取得済みのProject URLとPublishable keyへ置き換えて保存します。値をこのREADME、ソースコード、チャット、スクリーンショットへ貼り付けないでください。

```env
VITE_SUPABASE_URL=https://実際のProject-Ref.supabase.co
VITE_SUPABASE_ANON_KEY=実際のPublishable-key
```

## Git除外を確認する

次のコマンドは値を表示せず、`.env.local` がGit除外対象かだけを確認します。

```powershell
git check-ignore -v .env.local
git status --short
```

`git check-ignore` の結果に `.gitignore` の `.env.*` ルールが表示され、`git status --short` に `.env.local` が出なければ正常です。`.env.example` は値を含まない雛形としてGit管理します。

## ローカル接続を確認する

環境変数はVite起動時に読み込まれるため、設定後に開発サーバーを再起動します。

```powershell
npm run dev
```

ブラウザでアプリを開き、認証エリアがSupabase未設定の案内ではなく、アカウント作成・ログイン操作を表示することを確認します。その後、テスト用アカウントで認証を確認してください。

用品データのクラウド保存には、Phase 3-1のSQLマイグレーションとRLSがSupabase側へ適用済みである必要があります。ローカル設定だけではテーブルやRLSは作成されません。

## トラブル時

- 設定後も未設定表示になる場合は、開発サーバーを完全に停止して再起動します。
- Project URLの前後に空白や引用符が入っていないか確認します。
- Publishable keyを使用しているか確認します。
- ブラウザの開発者ツールやログへ環境変数の値を出力しないでください。
- 認証は動くが用品保存に失敗する場合は、Phase 3-1のマイグレーション適用とRLSポリシーを確認します。
