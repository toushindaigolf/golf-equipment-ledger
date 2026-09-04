# GA4確認チェックリスト

## デプロイ前

- [ ] `npm test`が成功する
- [ ] `npm run build`が成功する
- [ ] `git diff --check`が成功する
- [ ] `.env.example`に実測定IDが記載されていない
- [ ] Previewとローカルで`VITE_GA_ENABLED=false`になっている
- [ ] Previewへ本番測定IDが設定されていない

## 本番のリアルタイム確認

1. Cloudflare PagesのProduction環境変数を設定して再デプロイします。
2. ブラウザの開発者ツールで`gtag/js`と`g/collect`への通信を確認します。
3. GA4管理画面のリアルタイムレポートを開き、本番URLへアクセスします。
4. 初回の`page_view`が1回であることを確認します。
5. 使い方、問い合わせ、Pro案内、データ保存を順に操作し、対応イベントを確認します。
6. ログイン、アカウント作成、ログアウトはテスト用アカウントで必要な範囲だけ確認します。
7. イベントパラメータに個人情報・用品データ・検索語が含まれないことを確認します。

## DebugView

恒久的な`debug_mode`はソースへ設定していません。本番利用者へ影響させないため、確認担当者のブラウザだけでGoogle Tag Assistantを接続し、そのセッションをGA4のDebugViewで確認します。

- [ ] `page_view`が初回だけ発生する
- [ ] モーダル開閉で`page_view`が増えない
- [ ] `help_open`が発生する
- [ ] `privacy_policy_open`と`terms_open`が発生する
- [ ] `contact_click`がフォームリンクのクリック時に発生する
- [ ] `pro_notice_view`と`pro_feature_attempt`が固定`feature_name`で発生する
- [ ] `backup_download`が発生する
- [ ] 成功時だけ`sign_up`、`login`、`logout`が発生する
- [ ] 個人情報・用品情報を含むパラメータがない

## 環境分離

- [ ] stagingを開いても`gtag/js`と`g/collect`通信がない
- [ ] localhostを開いても`gtag/js`と`g/collect`通信がない
- [ ] staging・ローカルの操作が本番GA4のリアルタイムレポートへ入らない

## 表示と既存機能

- [ ] 360px、375px、390px、430px、768px、1280pxで表示が崩れない
- [ ] 登録・編集・削除、検索、絞り込み、並び替えが動作する
- [ ] 端末保存、クラウド保存、データ移行、認証が従来どおり動作する
- [ ] GA4通信をブロックしてもアプリを操作できる

