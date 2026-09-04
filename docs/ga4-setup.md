# Google Analytics 4設定

## 用途

本アプリでは、本番サイトのアクセス状況と、個人情報を含まない最小限の操作イベントを確認するためにGoogle Analytics 4（GA4）を使用します。GA4のデータをアプリ内へ表示する機能、Google Tag Manager、広告連携、個人単位の追跡は実装していません。

実装はGoogle公式の`gtag.js`を使用し、追加ライブラリは導入していません。初期化処理は`src/lib/ga4.ts`へ集約されています。

## 環境変数

Cloudflare PagesのProductionへ次を設定します。

```env
VITE_APP_ENV=production
VITE_GA_ENABLED=true
VITE_GA_MEASUREMENT_ID=G-6LV65LP4J6
```

Preview（`staging`ブランチ）では、本番アクセスとテストアクセスを混在させないため次を設定します。

```env
VITE_APP_ENV=staging
VITE_GA_ENABLED=false
VITE_GA_MEASUREMENT_ID=
```

ローカルの`.env.local`も計測を停止します。

```env
VITE_APP_ENV=local
VITE_GA_ENABLED=false
VITE_GA_MEASUREMENT_ID=
```

`VITE_APP_ENV=production`、`VITE_GA_ENABLED=true`、有効な`G-`形式の測定IDがすべて揃った場合だけ、GA4スクリプトを読み込みます。無効時や測定ID未設定時は`dataLayer`も作成しません。

## Cloudflare Pagesでの設定手順

1. Cloudflare Dashboardで対象のWorkers & Pagesプロジェクトを開きます。
2. SettingsのVariables and Secretsを開きます。
3. Productionへ本番用の3変数を設定します。
4. Previewへstaging用の3変数を設定します。本番の測定IDは設定しません。
5. 変数変更後にProductionを再デプロイします。
6. 本番URL`https://golf-equipment-ledger.pages.dev/`で確認します。

環境変数はViteのビルド時に埋め込まれる公開設定です。SupabaseのSecret key、認証トークンなどの秘密情報は設定しないでください。

## 将来staging計測を追加する場合

本番とは別のGA4プロパティまたはデータストリームを作成し、その専用測定IDだけをPreviewへ設定します。`src/lib/ga4.ts`は現在、意図しない本番データ混入を防ぐためproduction以外を強制的に無効化しています。staging計測を開始するときは、この制約をテストと一緒に明示的に変更してください。

## 運用上の注意

- GA4へメールアドレス、ユーザーID、用品データ、検索語を送らないでください。
- URLにクエリ文字列やハッシュがあっても、ページビューにはoriginとpathnameだけを使用します。
- GA4やネットワークの障害はアプリ操作を妨げません。
- イベント追加時は`Ga4Event`型へ固定名・固定パラメータとして追加し、任意オブジェクトを渡せる設計にしないでください。
- Cookie同意バナーとアプリ内オプトアウトは今回実装していません。公開地域や運用条件に応じて必要性を確認してください。

参考：[Google公式SPA計測ガイド](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)、[個人情報送信に関するGoogle Analyticsポリシー](https://support.google.com/analytics/answer/6366371)

