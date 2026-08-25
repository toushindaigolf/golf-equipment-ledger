# ゴルフ用品購入記録

「等身大ゴルフ」向けの、個人用ゴルフ用品購入記録MVPです。データはこのブラウザの `localStorage` に保存されます。

## 起動

```bash
npm install
npm run dev
```

## 本番ビルド

```bash
npm run build
```

`dist/` に静的ファイルが出力されます。初回はサンプル2件を表示し、登録・編集・削除・JSONバックアップと復元に対応しています。

## 回帰テスト

```bash
npm test
```

Free版の確認対象は、用品の登録・一覧・詳細・編集・削除、検索・カテゴリー/メーカー/ステータス絞り込み、並び替え、基本集計、JSONバックアップ/復元、CSV出力、PWA設定です。Phase 1では、既存データだけを使う年別の購入分析（月別購入額、カテゴリー別購入額、年間指標）も追加しています。

用品データは既存のlocalStorageキー `golf-equipment-ledger-v1` と配列形式を維持します。読み込み時にruntime validationと旧データのdefault補完を行いますが、読み込んだだけではlocalStorageを書き換えません。`demo-1` と `demo-2` は将来のクラウド移行対象から除外できるよう識別しています。

## Supabase Auth（Phase 2）

Phase 2ではメールアドレスとパスワードによるアカウント作成・ログイン・ログアウトのみを提供します。ログインしても用品データはSupabaseへ送信せず、従来と同じlocalStorageへ保存します。

`.env.example` を参考に、ローカルではGit管理対象外の `.env.local` を作成してください。

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Supabase側では次の設定が必要です。

- Authentication > ProvidersでEmailを有効化する
- 本番運用ではConfirm emailを有効化する
- Authentication > URL ConfigurationのSite URLに本番URLを設定する
- Redirect URLsにローカルURL、本番URL、利用するプレビューURLを登録する
- Cloudflare PagesのProductionとPreviewへ上記2つの環境変数を登録する

フロントエンドへ設定するのは公開可能なAnon Key（またはPublishable Key）のみです。Service Role Keyなどの秘密鍵は `.env` やCloudflare Pagesのフロントエンド用変数へ登録しないでください。環境変数が未設定でもアプリは起動し、端末内の用品記録機能はそのまま利用できます。

## GitHub Pages 公開

`vite.config.ts` は相対パス（`base: './'`）で設定済みです。リポジトリにpush後、GitHub Actions等で `npm ci && npm run build` を実行し、生成された `dist/` をGitHub Pagesへ公開してください。プロジェクトサイトのURLを使う場合も、相対パス指定のため追加のbase変更は不要です。

## Cloudflare Pages 公開

GitHubリポジトリを接続し、以下の値を設定してください。

- Build command: `npm run build`
- Build output directory: `dist`

依存関係はnpmに統一しています。`pnpm-lock.yaml`、`node_modules/`、`dist/`はGitへ追加しないでください。

## データについて

保存先は `src/repositories/equipmentRepository.ts` に集約しています。将来Supabaseへ移行する際は、このリポジトリを同じ操作契約で置き換えられます。売却価格は、ステータスにかかわらず入力されている金額を売却総額に反映します。未売却は0円です。売却日は任意項目で、旧データや旧バックアップに項目がない場合は空欄として安全に読み込みます。年別分析では購入を購入日、売却件数と売却額を売却日で集計し、売却日が空欄の記録は年間売却集計から除外します。
