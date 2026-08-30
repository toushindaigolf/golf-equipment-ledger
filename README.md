# ゴルフ用品購入記録

「等身大ゴルフ」向けの、個人用ゴルフ用品購入記録アプリです。未ログイン時はこの端末のブラウザ内に、ログイン後は移行期間中のクラウド保存先に用品データを保存します。端末内データはログインだけではクラウドへ移行されません。

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

Free版の確認対象は、用品の登録・一覧・詳細・編集・削除、文字検索、並び替え、基本集計、保存データファイルの作成・読み込み、PWA設定です。詳細な購入分析、カテゴリーなどを使った絞り込み、CSV出力、端末内データのクラウド移行はPro機能または準備中の機能として扱います。

用品データは既存のlocalStorageキー `golf-equipment-ledger-v1` と配列形式を維持します。読み込み時にruntime validationと旧データのdefault補完を行いますが、読み込んだだけではlocalStorageを書き換えません。`demo-1` と `demo-2` は将来のクラウド移行対象から除外できるよう識別しています。

## Supabase Auth（Phase 2）

メールアドレスとパスワードによるアカウント作成・ログイン・ログアウトを提供します。Phase 3-2以降は、ログイン中の用品データをSupabaseへ保存します。ログイン前の端末内データは自動移行しません。

`.env.example` を参考に、ローカルではGit管理対象外の `.env.local` を作成してください。

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_CONTACT_FORM_URL=
```

`VITE_SUPABASE_ANON_KEY` は既存コードとの互換性のための変数名です。値にはSupabase管理画面で取得したPublishable key（`sb_publishable_...`）を設定できます。Secret keyやService Role keyは設定しないでください。PowerShellでの作成方法、Git除外の確認、ローカル接続確認は [`docs/supabase-local-setup.md`](docs/supabase-local-setup.md) を参照してください。

Supabase側では次の設定が必要です。

- Authentication > ProvidersでEmailを有効化する
- 本番運用ではConfirm emailを有効化する
- Authentication > URL ConfigurationのSite URLに本番URLを設定する
- Redirect URLsにローカルURL、本番URL、利用するプレビューURLを登録する
- Cloudflare PagesのProductionとPreviewへSupabase用の上記2つの環境変数を登録する

フロントエンドへ設定するのは公開可能なAnon Key（またはPublishable Key）のみです。Service Role Keyなどの秘密鍵は `.env` やCloudflare Pagesのフロントエンド用変数へ登録しないでください。環境変数が未設定でもアプリは起動し、端末内の用品記録機能はそのまま利用できます。

## 問い合わせフォーム

問い合わせ導線にはGoogleフォームを利用します。フォームを作成したら、ローカルの `.env.local` とCloudflare Pagesの環境変数へ公開URLを設定してください。

```env
VITE_CONTACT_FORM_URL=https://docs.google.com/forms/d/e/your-form-id/viewform
```

この値はブラウザへ公開されるURLであり、秘密情報は設定しません。未設定、空欄、または `http` / `https` 以外の値の場合、アプリは壊れたリンクを表示せず「問い合わせフォームは準備中です」と表示します。

## 無料版の公開前確認

利用規約、プライバシーポリシー、問い合わせ、データ削除について、使い方、Free／Pro説明はアプリ下部のフッターから確認できます。公開情報の内容、データ削除の案内、未実装の決済機能については [`docs/free-release-information.md`](docs/free-release-information.md) に整理しています。

一般公開前に、本人および必要に応じて専門家が実際の運用内容と表示を確認してください。確認項目は [`docs/free-release-checklist.md`](docs/free-release-checklist.md) にまとめています。現在はStripe決済を実装していないため、アプリからPro版を購入することはできません。

## GitHub Pages 公開

`vite.config.ts` は相対パス（`base: './'`）で設定済みです。リポジトリにpush後、GitHub Actions等で `npm ci && npm run build` を実行し、生成された `dist/` をGitHub Pagesへ公開してください。プロジェクトサイトのURLを使う場合も、相対パス指定のため追加のbase変更は不要です。

## Cloudflare Pages 公開

GitHubリポジトリを接続し、以下の値を設定してください。

- Build command: `npm run build`
- Build output directory: `dist`

依存関係はnpmに統一しています。`pnpm-lock.yaml`、`node_modules/`、`dist/`はGitへ追加しないでください。

## データについて

保存処理はRepository層に集約し、認証状態に応じてlocalStorage用とSupabase用を切り替えます。UIコンポーネントから保存先を直接操作しません。売却価格は、ステータスにかかわらず入力されている金額を売却総額に反映します。未売却は0円です。売却日は任意項目で、旧データや旧バックアップに項目がない場合は空欄として安全に読み込みます。年別分析では購入を購入日、売却件数と売却額を売却日で集計し、売却日が空欄の記録は年間売却集計から除外します。

ローカルのSupabase接続設定は [`docs/supabase-local-setup.md`](docs/supabase-local-setup.md)、Phase 3-1のSupabaseテーブル、RLS、適用方法は [`docs/supabase-phase-3-1.md`](docs/supabase-phase-3-1.md)、Phase 3-2の保存先切り替えは [`docs/supabase-phase-3-2.md`](docs/supabase-phase-3-2.md)、Phase 3-3の明示的な端末データ移行は [`docs/supabase-phase-3-3.md`](docs/supabase-phase-3-3.md)、Phase 4のFree／Pro権限と手動付与方法は [`docs/supabase-phase-4.md`](docs/supabase-phase-4.md) を参照してください。
