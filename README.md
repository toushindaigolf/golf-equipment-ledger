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

## GitHub Pages 公開

`vite.config.ts` は相対パス（`base: './'`）で設定済みです。リポジトリにpush後、GitHub Actions等で `npm ci && npm run build` を実行し、生成された `dist/` をGitHub Pagesへ公開してください。プロジェクトサイトのURLを使う場合も、相対パス指定のため追加のbase変更は不要です。

## Cloudflare Pages 公開

GitHubリポジトリを接続し、以下の値を設定してください。

- Build command: `npm run build`
- Build output directory: `dist`

依存関係はnpmに統一しています。`pnpm-lock.yaml`、`node_modules/`、`dist/`はGitへ追加しないでください。

## データについて

保存先は `src/repositories/equipmentRepository.ts` に集約しています。将来Supabaseへ移行する際は、このリポジトリを同じ操作契約で置き換えられます。売却価格は、ステータスにかかわらず入力されている金額を売却総額に反映します。未売却は0円です。
