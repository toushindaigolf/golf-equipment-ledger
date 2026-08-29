export type ProFeatureName = '詳細な購入分析' | 'CSV出力' | '高度な絞り込み' | 'クラウドへのデータ移行';

export function ProFeatureNotice({ feature, loading = false, compact = false, onDetails }: {
  feature: ProFeatureName;
  loading?: boolean;
  compact?: boolean;
  onDetails: (feature: ProFeatureName) => void;
}) {
  return <section className={`pro-feature-notice${compact ? ' compact' : ''}`} aria-label={`${feature}の利用案内`}>
    <div>
      <p className="eyebrow">Pro機能</p>
      <strong>{loading ? 'プランを確認中です' : `${feature}はPro版限定です`}</strong>
      {!loading && <span>Free版の用品記録は引き続き利用できます。</span>}
    </div>
    <button type="button" className="secondary" disabled={loading} onClick={() => onDetails(feature)}>
      Pro版について
    </button>
  </section>;
}

export function ProUpgradeDialog({ feature, onClose }: {
  feature: ProFeatureName;
  onClose: () => void;
}) {
  return <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="panel pro-dialog" role="dialog" aria-modal="true" aria-labelledby="pro-dialog-title">
      <div className="panel-head">
        <div><p className="eyebrow">Pro版</p><h2 id="pro-dialog-title">{feature}</h2></div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="閉じる">×</button>
      </div>
      <p>この機能はPro版限定です。</p>
      <p>Pro版なら、用品の記録が増えても、見返す・探す・活用する作業を効率化できます。</p>
      <ul className="pro-benefit-list">
        <li><strong>購入の傾向を見える化</strong><span>年別・月別・カテゴリー別の分析で、使った金額や買い替えの傾向を把握できます。</span></li>
        <li><strong>必要な記録をすぐに発見</strong><span>カテゴリー・メーカー・ステータスを組み合わせて、目的の用品を素早く絞り込めます。</span></li>
        <li><strong>データを自由に活用</strong><span>CSV出力で、全用品を表計算ソフトで集計・保管できます。</span></li>
        <li><strong>どこからでも続きから</strong><span>クラウド保存と複数端末利用で、PCとスマートフォンから同じ記録を確認できます。</span></li>
      </ul>
      <p className="pro-dialog-note">Pro版の機能は準備中です。現在は決済機能を実装していないため、購入することはできません。価格と受付開始時期も未確定です。</p>
      <div className="form-actions"><button type="button" className="primary" onClick={onClose}>閉じる</button></div>
    </section>
  </div>;
}
