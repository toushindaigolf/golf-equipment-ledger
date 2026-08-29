export type PublicInfoPage = 'privacy' | 'terms' | 'contact' | 'help' | 'plans';

const pageTitles: Record<PublicInfoPage, string> = {
  privacy: 'プライバシーポリシー',
  terms: '利用規約',
  contact: '問い合わせ',
  help: 'アプリの使い方',
  plans: 'Free／Proについて',
};

function PrivacyPolicy({ contactConfigured }: { contactConfigured: boolean }) {
  return <>
    <p className="public-info-lead">本ポリシーは「ゴルフ用品購入記録」（以下「本サービス」）における、利用者情報の取り扱い方針を示すものです。</p>
    <div className="public-info-placeholders" role="note">
      <p>[要入力：運営者名]</p><p>[要入力：問い合わせ先]</p><p>[要入力：制定日]</p><p>[要入力：最終更新日]</p>
    </div>
    <h3>1. 収集・保存する情報</h3>
    <ul>
      <li>アカウント作成・認証に用いるメールアドレス、Supabase AuthのユーザーID（認証で使う識別番号）</li>
      <li>道具名、カテゴリー、メーカー、購入日・購入価格、売却日・売却価格、購入場所、購入理由、ステータス、メモなどの用品登録情報</li>
      <li>ログインしていないときに、ブラウザのlocalStorage（この端末のブラウザ保存領域）へ保存される用品データ</li>
      <li>ログインしてクラウド保存を利用するときに、Supabase（クラウドの保存サービス）へ保存される用品データ</li>
      <li>問い合わせ時に、利用者がGoogleフォームへ入力・送信する情報</li>
    </ul>
    <p>現時点で、本サービス独自のアクセス解析、広告配信および広告Cookieは実装していません。</p>
    <h3>2. 利用目的</h3>
    <ul>
      <li>アカウント認証、用品データの保存・表示、複数端末での利用のため</li>
      <li>端末内データをクラウド（Supabase）へ明示的に移行するため</li>
      <li>問い合わせ対応、不正利用・障害への対応、サービス改善のため</li>
    </ul>
    <h3>3. 利用する外部サービス</h3>
    <ul>
      <li>Supabase：ログイン認証、クラウド上の用品データおよび利用プラン情報の管理</li>
      <li>Cloudflare Pages：本サービスのWebアプリの配信</li>
      <li>Googleフォーム：問い合わせ窓口（設定・公開後に利用）</li>
    </ul>
    <p>各外部サービスにおける情報の取り扱いは、各サービス提供者の規約・ポリシーも適用されます。[要確認：各サービスの最新規約]</p>
    <h3>4. データの保存場所</h3>
    <p>ログインしていないときの用品データは、主に利用中のブラウザのlocalStorage（この端末のブラウザ保存領域）へ保存されます。ログインしてクラウド保存を利用するときは、Supabaseのデータベースへ保存されます。</p>
    <p>現在は移行期間中のため、ログイン済みのFreeユーザーもクラウド保存を利用できる場合があります。端末内データはログインだけでは自動移行されず、利用者による明示的な移行操作が必要です。</p>
    <h3>5. データとアカウントの削除</h3>
    <p>用品データは一覧画面から個別に削除できます。現在、アプリ内からのアカウント削除機能は実装していません。アカウントやクラウドデータの削除を希望する場合は、問い合わせフォームからご連絡ください。</p>
    {!contactConfigured && <p className="public-info-warning">現在、問い合わせフォームは準備中です。公開前に受付方法を設定してください。</p>}
    <h3>6. 安全管理・変更</h3>
    <p>情報への不正アクセス、紛失、漏えい等を防ぐため、合理的な安全管理に努めます。本ポリシーを変更する場合は、本サービス上で分かる方法により案内します。</p>
    <p className="public-info-review">[要確認：公開前に本人および必要に応じて専門家が内容を確認してください]</p>
  </>;
}

function Terms({ contactConfigured }: { contactConfigured: boolean }) {
  return <>
    <p className="public-info-lead">この利用規約（以下「本規約」）は、「ゴルフ用品購入記録」の利用条件を定めるものです。</p>
    <div className="public-info-placeholders" role="note">
      <p>[要入力：運営者名]</p><p>[要入力：制定日]</p><p>[要入力：最終更新日]</p>
    </div>
    <h3>1. サービスの概要</h3>
    <p>本サービスは、ゴルフ用品の購入・売却履歴を利用者自身が記録・管理するためのWebアプリです。登録内容の正確性は、利用者自身で確認してください。</p>
    <h3>2. 利用条件とアカウント管理</h3>
    <ul>
      <li>利用者は、本規約とプライバシーポリシーに同意したうえで本サービスを利用します。</li>
      <li>ログイン情報を適切に管理し、第三者に利用させないでください。</li>
      <li>パスワードを問い合わせフォームへ入力・送信しないでください。</li>
    </ul>
    <h3>3. データの取り扱いとバックアップ</h3>
    <p>ログインしていないときは、クラウド保存サービス（Supabase）が未設定の場合を含め、用品データをブラウザのlocalStorage（この端末のブラウザ保存領域）へ保存します。ブラウザデータの消去、端末変更や故障によりデータを利用できなくなる場合があります。</p>
    <p>ログイン時は用品データをクラウドへ保存しますが、通信障害や外部サービスの障害などにより、一時的に保存・表示できない場合があります。端末内データは自動移行されません。</p>
    <p>重要なデータは、JSONバックアップを利用者自身でも定期的に保存してください。移行操作の前にもJSONバックアップを推奨します。</p>
    <h3>4. Free版とPro版</h3>
    <p>Free／Proの提供内容は、サービス改善や運営上の理由により将来変更される場合があります。現在はStripe決済を提供しておらず、Pro版を購入することはできません。また、移行期間中はログイン済みのFreeユーザーもクラウド保存を利用できる場合があります。</p>
    <h3>5. 禁止事項</h3>
    <ul>
      <li>法令または公序良俗に反する行為</li>
      <li>本サービス、他の利用者または第三者の権利・利益を侵害する行為</li>
      <li>不正アクセス、過度な負荷、サービス運営を妨げる行為</li>
      <li>他人になりすます行為、アカウントを不正に利用する行為</li>
    </ul>
    <h3>6. サービスの停止・変更</h3>
    <p>保守、障害、外部サービスの停止その他必要な場合、本サービスの全部または一部を停止・変更することがあります。可能な範囲で事前または事後に案内します。</p>
    <h3>7. 免責事項</h3>
    <p>本サービスは、通信障害、端末故障、ブラウザデータの消去その他の事由によるデータ消失を完全に防止・保証するものではありません。また、登録データをもとに行われた判断について、利用者自身で内容を確認してください。[要確認：専門家確認]</p>
    <h3>8. 規約の変更・準拠法・管轄</h3>
    <p>本規約を変更する場合は、本サービス上で分かる方法により案内します。本規約の準拠法は日本法とします。紛争が生じた場合の合意管轄は、運営者情報の確定後に定めます。[要入力：管轄裁判所][要確認：専門家確認]</p>
    <h3>9. 問い合わせ</h3>
    <p>{contactConfigured ? '本サービス内の問い合わせページからご連絡ください。' : '問い合わせフォームは現在準備中です。[要入力：問い合わせ方法]'}</p>
    <p className="public-info-review">[要確認：公開前に本人および必要に応じて専門家が内容を確認してください]</p>
  </>;
}

function Contact({ contactFormUrl }: { contactFormUrl: string | null }) {
  return <>
    <p className="public-info-lead">次の内容について、Googleフォームから受け付ける予定です。</p>
    <ul>
      <li>不具合報告</li><li>データに関する相談</li><li>アカウント・クラウドデータの削除依頼</li><li>サービスに関する質問</li><li>改善要望</li>
    </ul>
    <p className="public-info-warning">パスワード、サービスの設定情報（Supabaseのキーなど）、クレジットカード情報などの秘密情報は入力しないでください。削除依頼では、本人確認のため追加の確認をお願いする場合があります。</p>
    {contactFormUrl
      ? <a className="primary public-info-external" href={contactFormUrl} target="_blank" rel="noopener noreferrer">問い合わせフォームを開く<span aria-hidden="true"> ↗</span></a>
      : <div className="public-info-unavailable" role="status"><strong>問い合わせフォームは準備中です</strong><span>フォーム公開後に、こちらから問い合わせできるようになります。</span></div>}
  </>;
}

function Help() {
  return <>
    <p className="public-info-lead">最初にJSONバックアップの場所を確認しておくと、安心して記録を続けられます。</p>
    <ol className="public-info-steps">
      <li><strong>用品を登録する</strong><span>画面上部の「＋ 新規登録」から、道具名、購入日、価格などを入力します。</span></li>
      <li><strong>記録を確認・更新する</strong><span>一覧の「詳細」「編集」「削除」から各用品を管理します。削除は元に戻せません。</span></li>
      <li><strong>記録を探す</strong><span>文字検索と並び替えを利用できます。カテゴリー、メーカー、ステータスによる高度な絞り込みはPro機能です。</span></li>
      <li><strong>バックアップを保存する</strong><span>「バックアップ」で全用品のJSONファイルを保存します。端末内保存時の「復元」は現在の端末内記録を置き換えるため、実行前に内容を確認してください。</span></li>
      <li><strong>クラウド保存を利用する</strong><span>ログイン後に登録・編集した用品はクラウド（Supabase）へ保存され、同じアカウントで利用できます。</span></li>
      <li><strong>端末内データを移行する</strong><span>ログインだけでは自動移行されません。移行画面で内容を確認し、明示的に移行操作を行います。</span></li>
      <li><strong>移行前にもバックアップする</strong><span>移行機能は開始前にバックアップを作成しますが、大切なデータは利用者自身でも保管してください。</span></li>
    </ol>
  </>;
}

function Plans() {
  return <>
    <p className="public-info-lead">日々の記録に必要な基本機能はFree版で利用できます。Pro版は、記録をより詳しく振り返るための機能を提供する予定です。</p>
    <div className="plan-comparison">
      <section><p className="eyebrow">Free</p><h3>基本の記録・管理</h3><ul>
        <li>用品の登録・編集・削除、基本一覧</li><li>文字検索、並び替え、基本集計</li><li>JSONバックアップ（端末内保存時は復元も利用可能）</li><li>ログインしないときの、この端末への保存</li>
      </ul></section>
      <section className="pro"><p className="eyebrow">Pro</p><h3>詳しい分析・活用</h3><ul>
        <li>詳細・年別・月別・カテゴリー別分析</li><li>CSV出力</li><li>カテゴリー・メーカー・ステータスによる高度な絞り込み</li><li>端末内の保存データからクラウドへのデータ移行</li><li>クラウド保存、複数端末利用</li><li>将来の広告非表示（提供時期未定）</li>
      </ul></section>
    </div>
    <div className="public-info-unavailable"><strong>Pro版の機能は準備中です</strong><span>現在は決済機能を実装していないため、購入することはできません。価格も未確定です。</span></div>
    <p>現在は移行期間中のため、ログイン済みのFreeユーザーもクラウド保存を利用できます。正式提供時の対象機能は変更される可能性があります。</p>
  </>;
}

export function PublicInfoDialog({ page, contactFormUrl, onClose }: {
  page: PublicInfoPage;
  contactFormUrl: string | null;
  onClose: () => void;
}) {
  const title = pageTitles[page];
  return <div className="overlay public-info-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="panel public-info-dialog" role="dialog" aria-modal="true" aria-labelledby="public-info-title">
      <div className="panel-head">
        <div><p className="eyebrow">アプリ情報</p><h2 id="public-info-title">{title}</h2></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="閉じる">×</button>
      </div>
      <article className="public-info-content">
        {page === 'privacy' && <PrivacyPolicy contactConfigured={Boolean(contactFormUrl)} />}
        {page === 'terms' && <Terms contactConfigured={Boolean(contactFormUrl)} />}
        {page === 'contact' && <Contact contactFormUrl={contactFormUrl} />}
        {page === 'help' && <Help />}
        {page === 'plans' && <Plans />}
      </article>
      <div className="public-info-close"><button type="button" className="secondary" onClick={onClose}>閉じる</button></div>
    </section>
  </div>;
}
