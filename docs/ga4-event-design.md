# GA4イベント設計

## ページビュー

| イベント | 発生条件 | パラメータ |
| --- | --- | --- |
| `page_view` | 本番アプリの初回表示時に1回 | `page_title`、`page_location`、`page_path` |

`gtag('config')`では`send_page_view: false`を指定し、その直後に初回ページビューを明示的に1回送信します。モーダル開閉ではURLも実ページも変わらないため、追加のページビューは送信しません。`page_location`はクエリ文字列とハッシュを除外したoriginとpathnameだけです。

`session_start`と`first_visit`はGA4の標準処理に任せ、アプリから重複送信しません。

## カスタムイベント

| イベント | 発生条件 | パラメータ |
| --- | --- | --- |
| `help_open` | 「アプリの使い方」を開く | なし |
| `privacy_policy_open` | プライバシーポリシーを開く | なし |
| `terms_open` | 利用規約を開く | なし |
| `contact_click` | Googleフォームへのリンクを押す | なし |
| `pro_notice_view` | FreeユーザーへPro機能案内が表示される | `feature_name` |
| `pro_feature_attempt` | FreeユーザーがPro機能の操作を試す | `feature_name` |
| `backup_download` | 保存データファイルのダウンロードを開始する | なし |
| `sign_up` | アカウント作成処理が成功する | なし |
| `login` | ログイン処理が成功する | なし |
| `logout` | ログアウト処理が成功する | なし |

`feature_name`は`detailed_analytics`、`csv_export`、`advanced_filters`、`equipment_migration`の固定値だけです。

`pro_notice_view`は同一ページ表示中、同じ機能について1回だけ送信します。`pro_feature_attempt`は利用者のクリックごとに送信します。

## 送信禁止データ

メールアドレス、氏名、電話番号、住所、SupabaseのユーザーID・UUID、認証情報、用品名、メーカー、カテゴリー、価格、日付、メモ、バックアップ内容、検索語、localStorage・Supabaseのレコード、Cookie値、Stripe情報は送信しません。`user_id`と`user_properties`も設定しません。

イベントAPIは型で許可イベントとパラメータを固定しており、UIから任意のデータオブジェクトを渡せません。

