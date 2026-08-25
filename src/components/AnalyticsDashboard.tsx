import { useEffect, useMemo, useState } from 'react';
import { categoryName } from '../data/categories';
import { analyzeEquipmentYear, availableAnalysisYears } from '../lib/analytics';
import { yen } from '../lib/format';
import type { GolfEquipment } from '../types/equipment';

const compactYen = (value: number) => {
  if (value === 0) return '0';
  if (Math.abs(value) >= 10000) {
    return `${new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 1 }).format(value / 10000)}万`;
  }
  return new Intl.NumberFormat('ja-JP').format(value);
};

export function AnalyticsDashboard({ items }: { items: GolfEquipment[] }) {
  const years = useMemo(() => availableAnalysisYears(items), [items]);
  const [selectedYear, setSelectedYear] = useState(years[0]);

  useEffect(() => {
    if (!years.includes(selectedYear)) setSelectedYear(years[0]);
  }, [selectedYear, years]);

  const analytics = useMemo(
    () => analyzeEquipmentYear(items, selectedYear),
    [items, selectedYear],
  );
  const maxMonthlyAmount = Math.max(...analytics.monthlyPurchases.map(month => month.amount), 0);
  const maxCategoryAmount = Math.max(...analytics.categoryPurchases.map(category => category.amount), 0);
  const maxCategory = analytics.maxCategoryId ? categoryName(analytics.maxCategoryId) : '—';
  const metrics = [
    ['年間購入件数', `${analytics.purchaseCount}件`],
    ['年間売却件数', `${analytics.saleCount}件`],
    ['年間購入額', yen(analytics.purchaseTotal)],
    ['年間売却額', yen(analytics.saleTotal)],
    ['実質支出額', yen(analytics.netTotal)],
    ['最大カテゴリー', maxCategory],
  ];

  return <section className="analytics" aria-labelledby="analytics-heading">
    <div className="analytics-head">
      <div>
        <p className="analytics-kicker">年間サマリー</p>
        <h2 id="analytics-heading">購入分析</h2>
      </div>
      <label className="analytics-year">分析年
        <select value={selectedYear} onChange={event => setSelectedYear(Number(event.target.value))}>
          {years.map(year => <option key={year} value={year}>{year}年</option>)}
        </select>
      </label>
    </div>

    <div className="analytics-metrics">
      {metrics.map(([label, value]) => <article className="analytics-metric" key={label}>
        <span>{label}</span>
        <strong>{value}</strong>
      </article>)}
    </div>

    <div className="analytics-charts">
      <article className="analytics-chart-panel">
        <div className="analytics-chart-head">
          <h3>月別購入額</h3>
          <span>{selectedYear}年</span>
        </div>
        {analytics.purchaseCount === 0 ? <p className="analytics-empty">この年の購入記録はありません。</p> :
          <ol className="monthly-chart" aria-label={`${selectedYear}年の月別購入額`}>
            {analytics.monthlyPurchases.map(month => {
              const height = maxMonthlyAmount === 0 ? 0 : month.amount / maxMonthlyAmount * 100;
              return <li key={month.month} aria-label={`${month.month}月 ${yen(month.amount)}`}>
                <span className="monthly-value" aria-hidden="true">{compactYen(month.amount)}</span>
                <span className="monthly-track" aria-hidden="true"><span style={{ height: `${height}%` }} /></span>
                <span className="monthly-label" aria-hidden="true">{month.month}月</span>
              </li>;
            })}
          </ol>}
      </article>

      <article className="analytics-chart-panel">
        <div className="analytics-chart-head">
          <h3>カテゴリー別購入額</h3>
          <span>{analytics.categoryPurchases.length}カテゴリー</span>
        </div>
        {analytics.categoryPurchases.length === 0 ? <p className="analytics-empty">この年のカテゴリー集計はありません。</p> :
          <ol className="category-chart" aria-label={`${selectedYear}年のカテゴリー別購入額`}>
            {analytics.categoryPurchases.map(category => {
              const width = maxCategoryAmount === 0 ? 0 : category.amount / maxCategoryAmount * 100;
              return <li key={category.categoryId}>
                <div><span>{categoryName(category.categoryId)}</span><strong>{yen(category.amount)}</strong></div>
                <span className="category-track" aria-hidden="true"><span style={{ width: `${width}%` }} /></span>
              </li>;
            })}
          </ol>}
      </article>
    </div>

    <p className="analytics-note">購入は購入日、売却件数・売却額は売却日を基準に集計しています。売却日が空欄の記録は年間売却集計に含まれません。</p>
  </section>;
}
