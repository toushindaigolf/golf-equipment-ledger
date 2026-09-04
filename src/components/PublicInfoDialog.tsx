import { trackGa4Event } from '../lib/ga4';

export type PublicInfoPage = 'privacy' | 'terms' | 'contact' | 'deletion' | 'help' | 'plans';

const policyDate = '2026年8月30日';
const policyUpdatedDate = '2026年9月4日';

const pageTitles: Record<PublicInfoPage, string> = {
  privacy: 'プライバシーポリシー',
  terms: '利用規約',
  contact: '問い合わせ',
  deletion: 'データ削除について',
  help: 'アプリの使い方',
  plans: 'Free／Proについて',
};

function PublicationDetails() {
  return <div className="public-info-meta" role="note">
    <p><strong>サービス・運営者</strong><span>等身大ゴルフ</span></p>
    <p><strong>問い合わせ先</strong><span>Googleフォーム</span></p>
    <p><strong>制定日</strong><span>{policyDate}</span></p>
    <p><strong>最終更新日</strong><span>{policyUpdatedDate}</span></p>
  </div>;
}

function ContactActions({ contactFormUrl, deletionOnly = false }: {
  contactFormUrl: string | null;
  deletionOnly?: boolean;
}) {
  if (!contactFormUrl) {
    return <div className="public-info-unavailable" role="status">
      <strong>問い合わせフォームは準備中です</strong>
      <span>公開後に、問い合わせやデータ削除の依頼を受け付けます。</span>
    </div>;
  }

  return <div className="public-info-actions">
    {!deletionOnly && <a className="secondary public-info-external" href={contactFormUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackGa4Event({ name: 'contact_click' })}>問い合わせる<span aria-hidden="true"> ↗</span></a>}
    <a className={deletionOnly ? 'primary public-info-external' : 'secondary public-info-external'} href={contactFormUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackGa4Event({ name: 'contact_click' })}>データ削除を依頼する<span aria-hidden="true"> ↗</span></a>
  </div>;
}

function PrivacyPolicy({ contactFormUrl }: { contactFormUrl: string | null }) {
  return <>
    <p className="public-info-lead">本ポリシーは「等身大ゴルフ｜ゴルフ用品購入記録」（以下「本サービス」）における、利用者情報の取り扱い方針を示すものです。</p>
    <PublicationDetails />

    <h3>1. 取得する情報</h3>
    <ul>
      <li>アカウント作成・ログインに用いるメールアドレスおよび認証用のユーザーID</li>
      <li>道具名、カテゴリー、メーカー、購入日・購入価格、売却日・売却価格、購入場所、購入理由、ステータス、メモなど、利用者が入力した用品情報</li>
      <li>問い合わせフォームから利用者が送信する内容</li>
      <li>閲覧したページ、利用日時、ブラウザ・端末に関する情報、操作イベントなどのアクセス情報</li>
    </ul>
    <p>アクセス解析にはGoogle Analytics 4を利用します。Google Analytics 4は、Cookieまたはこれに類する識別子を使用する場合があります。本サービスは、メールアドレス、認証用のユーザーID、用品情報、検索語をアクセス解析用のイベントとして意図的に送信しません。</p>

    <h3>2. 利用目的</h3>
    <ul>
      <li>本サービスの提供、用品データの表示・保存、アカウント認証のため</li>
      <li>利用者が明示的に行う、端末内データからクラウドへの移行のため</li>
      <li>問い合わせ対応、不具合調査、不正利用への対応およびサービス改善のため</li>
      <li>利用状況の把握、画面や機能の改善およびサービス運営上の判断のため</li>
    </ul>

    <h3>3. 保存場所と保存期間</h3>
    <p>ログインしていないときの用品データは、利用中のブラウザの端末内保存領域（localStorage）に保存されます。端末内データは、利用者がブラウザのサイトデータを削除するまで残る場合があります。</p>
    <p>ログイン後にクラウド保存を利用しているときは、用品データおよび認証に必要な情報をSupabaseのサービス上に保存します。現在のクラウド保存は移行期間中の動作であり、Free版の恒久的な提供特典を示すものではありません。正式な提供条件は今後変更される場合があります。</p>
    <p>クラウド上のデータは、サービス提供または削除依頼への対応に必要な範囲で保存します。現時点では一律の自動削除期限を設けていません。</p>

    <h3>4. 利用する外部サービス</h3>
    <ul>
      <li>Supabase：アカウント認証、クラウド上の用品データおよび利用プラン情報の管理</li>
      <li>Cloudflare Pages：本サービスのWebアプリの配信</li>
      <li>Googleフォーム：問い合わせ、不具合報告およびデータ削除依頼の受付</li>
      <li>Google Analytics 4：アクセス状況および機能の利用状況の分析</li>
    </ul>
    <p>Google Analytics 4で収集された情報はGoogleに送信され、Googleの規約・ポリシーに基づいて取り扱われます。その他の外部サービスについても、各サービス提供者の規約・ポリシーが適用されます。</p>
    <p>利用者はブラウザの設定でCookieを制限または削除できます。ただし、その設定はブラウザや端末ごとに行う必要があり、一部のサービス動作に影響する場合があります。</p>

    <h3>5. データの確認・削除</h3>
    <ul>
      <li>用品データは、一覧画面から1件ずつ削除できます。削除した記録は元に戻せません。</li>
      <li>端末内データは、「データを保存」でファイルを保管したうえで、ブラウザのサイトデータを削除することで利用者自身が削除できます。</li>
      <li>クラウド上の用品データまたはアカウントの削除を希望する場合は、Googleフォームから登録メールアドレスと削除を希望する内容をお知らせください。本人確認後に対応します。</li>
    </ul>
    <p>アプリ内には、アカウントやクラウドデータを一括で即時削除する機能はありません。削除依頼の完了時期は、依頼内容の確認後に個別に案内します。</p>
    <ContactActions contactFormUrl={contactFormUrl} deletionOnly />

    <h3>6. 安全管理・問い合わせ・ポリシーの変更</h3>
    <p>不正アクセス、紛失、漏えい等を防ぐため、アクセス制御および外部サービスの安全機能を利用して合理的な安全管理に努めます。情報の取り扱いに関する問い合わせは、Googleフォームから受け付けます。</p>
    <p>利用する解析項目や外部サービスの設定は、サービス改善や運用上の必要に応じて変更する場合があります。本ポリシーを変更する場合は、本サービス上で分かる方法により案内します。</p>
    <p className="public-info-review">公開前に、実際の運用内容および法的な表現について、必要に応じて専門家へ確認してください。</p>
  </>;
}

function Terms({ contactFormUrl }: { contactFormUrl: string | null }) {
  return <>
    <p className="public-info-lead">この利用規約（以下「本規約」）は、「等身大ゴルフ｜ゴルフ用品購入記録」の利用条件を定めるものです。</p>
    <PublicationDetails />

    <h3>1. サービスの目的</h3>
    <p>本サービスは、ゴルフ用品の購入・売却履歴を利用者自身が記録・管理するためのWebアプリです。登録内容および本サービスをもとにした判断は、利用者自身で確認してください。</p>

    <h3>2. 利用開始とアカウント管理</h3>
    <p>本サービスは、ログインなしでも基本的な記録機能を利用できます。アカウントを作成する場合、利用者は正確な情報を入力し、メールアドレスおよびパスワードを適切に管理してください。パスワードを問い合わせフォームへ入力・送信しないでください。</p>

    <h3>3. Free版の利用条件</h3>
    <p>Free版では、用品の登録・編集・削除、一覧表示、道具名・メーカーによる文字検索、並び替え、基本集計、端末内への保存、保存データファイルの作成・読み込み、PWAとしての利用およびアカウント作成・ログインを利用できます。</p>

    <h3>4. クラウド保存とPro機能</h3>
    <p>Free版は基本的に端末内保存を利用します。ログイン後のクラウド保存は移行期間中の動作として提供しており、正式な提供条件は今後変更される場合があります。端末内データはログインだけではクラウドへ移行されません。</p>
    <p>詳細な購入分析、高度な絞り込み、CSV出力、端末内データのクラウド移行、複数端末での本格的な同期および広告非表示は、Pro機能または準備中の機能です。Stripeによる決済、定期更新、返金および解約処理は現在実装しておらず、Pro版を購入することはできません。</p>

    <h3>5. データ管理</h3>
    <p>端末内に保存されたデータは、ブラウザのデータ消去、端末変更、故障等により利用できなくなる場合があります。大切なデータは、「データを保存」から作成できるJSON形式のファイルを定期的に保管してください。保存データを読み込むと、端末内の現在の記録を置き換えます。</p>

    <h3>6. 禁止事項</h3>
    <ul>
      <li>法令または公序良俗に反する行為</li>
      <li>本サービス、他の利用者または第三者の権利・利益を侵害する行為</li>
      <li>不正アクセス、他人のデータへのアクセス、なりすまし、アカウントの不正利用</li>
      <li>過度な負荷をかける行為その他サービス運営を妨げる行為</li>
    </ul>

    <h3>7. 停止・変更・利用終了</h3>
    <p>保守、障害、外部サービスの停止その他必要な場合、本サービスの全部または一部を停止・変更することがあります。利用を終了したい場合は、必要に応じて端末内データを削除し、クラウドデータまたはアカウントの削除を希望するときは問い合わせフォームから依頼してください。</p>

    <h3>8. 免責事項と規約変更</h3>
    <p>本サービスは、通信障害、端末故障、ブラウザデータの消去、外部サービスの障害その他の事由によるデータ消失を完全に防止・保証するものではありません。本規約を変更する場合は、本サービス上で分かる方法により案内します。</p>
    <ContactActions contactFormUrl={contactFormUrl} />
    <p className="public-info-review">公開前に、実際の運用内容および法的な表現について、必要に応じて専門家へ確認してください。</p>
  </>;
}

function Contact({ contactFormUrl }: { contactFormUrl: string | null }) {
  return <>
    <p className="public-info-lead">不具合報告、サービスに関する質問、改善要望、データに関する相談をGoogleフォームから受け付けます。</p>
    <ul>
      <li>操作上の不具合や表示の問題</li>
      <li>アカウント、用品データ、クラウド保存に関する相談</li>
      <li>クラウド上の用品データまたはアカウントの削除依頼</li>
      <li>サービスに関する質問・改善要望</li>
    </ul>
    <p className="public-info-warning">パスワード、サービスの設定情報、クレジットカード情報などの秘密情報は入力しないでください。データ削除を依頼する場合は、登録メールアドレスと削除を希望する内容を記載してください。本人確認のため追加の確認をお願いする場合があります。</p>
    <ContactActions contactFormUrl={contactFormUrl} />
  </>;
}

function DataDeletion({ contactFormUrl }: { contactFormUrl: string | null }) {
  return <>
    <p className="public-info-lead">データの保存場所によって削除方法が異なります。削除後は元に戻せないため、必要であれば先に保存データファイルを作成してください。</p>
    <h3>端末内に保存したデータ</h3>
    <ol className="public-info-steps">
      <li><strong>データを保存する</strong><span>必要な記録は「データを保存」からJSON形式のファイルとして保管します。</span></li>
      <li><strong>ブラウザのサイトデータを削除する</strong><span>ブラウザの設定から、本サービスのサイトデータを削除します。これにより端末内の用品記録が削除されます。</span></li>
      <li><strong>削除後は復元できない</strong><span>保存データファイルがない場合、削除した端末内データを元に戻すことはできません。</span></li>
    </ol>
    <h3>クラウドに保存したデータ・アカウント</h3>
    <p>一覧画面から用品を1件ずつ削除できます。クラウド上の用品データまたはアカウントをまとめて削除したい場合は、Googleフォームから依頼してください。アプリ内での即時・自動削除機能は現在提供していません。</p>
    <p>依頼には、登録メールアドレスと削除を希望する内容（用品データのみ、アカウントを含む、など）を記載してください。本人確認後に対応し、対応方法や完了時期は個別に案内します。</p>
    <ContactActions contactFormUrl={contactFormUrl} deletionOnly />
  </>;
}

function Help({ contactFormUrl }: { contactFormUrl: string | null }) {
  return <>
    <p className="public-info-lead">Free版はログインなしで利用できます。まずは用品を記録し、必要に応じて保存データファイルを保管してください。</p>
    <ol className="public-info-steps">
      <li><strong>用品を登録する</strong><span>画面上部の「＋ 新規登録」から、道具名、購入日、価格などを入力します。</span></li>
      <li><strong>記録を編集・削除する</strong><span>一覧の「詳細」「編集」「削除」から各用品を管理します。削除した記録は元に戻せません。</span></li>
      <li><strong>記録を探して並べ替える</strong><span>道具名・メーカーによる文字検索と、購入日・価格による並び替えを利用できます。</span></li>
      <li><strong>データを保存・読み込む</strong><span>「データを保存」で全用品をJSON形式のファイルとして保管できます。端末内保存時の「保存データを読み込む」は、現在の端末内記録を置き換えるため、実行前に内容を確認してください。</span></li>
      <li><strong>端末内データを大切に保管する</strong><span>ログインなしのデータは、この端末のブラウザに保存されます。ブラウザのデータ消去、端末変更や故障に備え、定期的な保存をおすすめします。</span></li>
      <li><strong>ログインとクラウド保存について</strong><span>アカウントを作成すると、移行期間中はクラウド保存を利用できます。ただし、端末内データはログインだけでは移行されず、クラウド保存・複数端末利用の正式な条件は今後変更される場合があります。</span></li>
      <li><strong>困ったときは問い合わせる</strong><span>不具合報告、データ削除依頼、改善要望はGoogleフォームから受け付けます。</span></li>
    </ol>
    <ContactActions contactFormUrl={contactFormUrl} />
  </>;
}

function Plans() {
  return <>
    <p className="public-info-lead">Free版では、日々の用品記録に必要な基本機能をログインなしで利用できます。Pro版は、記録を詳しく振り返り、整理・活用するための機能を提供する予定です。</p>
    <div className="plan-comparison">
      <section><p className="eyebrow">Free</p><h3>基本の記録・管理</h3><ul>
        <li>用品の登録・編集・削除、一覧表示</li><li>道具名・メーカーによる文字検索、並び替え</li><li>購入額・売却額・実質支出額などの基本集計</li><li>端末内への保存、保存データファイルの作成・読み込み</li><li>PWAとしての利用、アカウント作成・ログイン</li>
      </ul></section>
      <section className="pro"><p className="eyebrow">Pro・準備中</p><h3>詳しい分析・活用</h3><ul className="pro-benefit-list">
        <li><strong>購入の傾向を見える化</strong><span>年別・月別・カテゴリー別に購入額や売却額を確認できます。</span></li>
        <li><strong>必要な記録をすぐに発見</strong><span>カテゴリー・メーカー・ステータスを組み合わせて絞り込めます。</span></li>
        <li><strong>データを自由に活用</strong><span>CSV出力で、全用品を表計算ソフトで集計・保管できます。</span></li>
        <li><strong>端末内データをクラウドへ移行</strong><span>保存済みの記録を確認しながら、クラウドへ移して管理できます。</span></li>
        <li><strong>本格的な複数端末利用</strong><span>クラウド保存と複数端末同期の正式な提供条件は調整中です。</span></li>
        <li><strong>広告非表示・決済機能</strong><span>Stripeによる決済、定期更新、返金、解約を含め、現在準備中です。</span></li>
      </ul></section>
    </div>
    <div className="public-info-unavailable"><strong>Pro版の購入は現在準備中です</strong><span>決済機能、価格、提供開始時期は未確定のため、現時点でPro版を購入することはできません。</span></div>
    <p>Free版は基本的に端末内保存を利用します。ログイン後のクラウド保存は移行期間中の動作として提供しており、正式な提供条件は今後変更される場合があります。</p>
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
        {page === 'privacy' && <PrivacyPolicy contactFormUrl={contactFormUrl} />}
        {page === 'terms' && <Terms contactFormUrl={contactFormUrl} />}
        {page === 'contact' && <Contact contactFormUrl={contactFormUrl} />}
        {page === 'deletion' && <DataDeletion contactFormUrl={contactFormUrl} />}
        {page === 'help' && <Help contactFormUrl={contactFormUrl} />}
        {page === 'plans' && <Plans />}
      </article>
      <div className="public-info-close"><button type="button" className="secondary" onClick={onClose}>閉じる</button></div>
    </section>
  </div>;
}
