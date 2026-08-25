import { useMemo, useRef, useState } from 'react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuthPanel } from './components/AuthPanel';
import { EquipmentForm } from './components/EquipmentForm';
import { EquipmentStorageStatus } from './components/EquipmentStorageStatus';
import { categories, categoryName } from './data/categories';
import { manufacturers } from './data/manufacturers';
import { shaftManufacturers } from './data/shaftManufacturers';
import { statusName, statuses } from './data/statuses';
import { useAuth } from './hooks/useAuth';
import { useEquipment } from './hooks/useEquipment';
import { equipmentToCsv } from './lib/csv';
import { parseEquipmentData } from './lib/equipmentData';
import { date, summary, yen } from './lib/format';
import type { GolfEquipment, SortOption } from './types/equipment';

const sortLabels: Record<SortOption, string> = { newest: '購入日の新しい順', oldest: '購入日の古い順', price_desc: '購入価格の高い順', price_asc: '購入価格の安い順' };

function Detail({ item, onClose, onEdit }: { item: GolfEquipment; onClose: () => void; onEdit: () => void }) {
  const fields = [['カテゴリ', categoryName(item.categoryId)], ['メーカー', item.manufacturer], ['購入日', date(item.purchaseDate)], ['購入価格', yen(item.purchasePrice)], ['売却価格', yen(item.salePrice)], ['売却日', item.saleDate ? date(item.saleDate) : ''], ['購入場所', item.purchasePlace], ['購入理由', item.purchaseReason], ['メモ', item.memo]];
  return <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="panel detail" role="dialog" aria-modal="true" aria-label="用品の詳細"><div className="panel-head"><div><p className="eyebrow">{categoryName(item.categoryId)}</p><h2>{item.name}</h2></div><button className="icon-button" onClick={onClose} aria-label="閉じる">×</button></div><span className={'status ' + item.status}>{statusName(item.status)}</span><dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl><div className="form-actions"><button className="secondary" onClick={onClose}>閉じる</button><button className="primary" onClick={onEdit}>編集する</button></div></section></div>;
}

export default function App() {
  const auth = useAuth();
  const equipment = useEquipment({ userId: auth.user?.id, authLoading: auth.loading });
  const { items, create, update, remove, restore } = equipment;
  const [editing, setEditing] = useState<GolfEquipment>();
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<GolfEquipment>();
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [category, setCategory] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const fileRef = useRef<HTMLInputElement>(null);
  const totals = summary(items);
  const visible = useMemo(() => items.filter(i => (!appliedQuery || `${i.name} ${i.manufacturer}`.toLowerCase().includes(appliedQuery.toLowerCase())) && (!category || i.categoryId === category) && (!status || i.status === status) && (!manufacturer || i.manufacturer === manufacturer)).sort((a, b) => sort === 'newest' ? b.purchaseDate.localeCompare(a.purchaseDate) : sort === 'oldest' ? a.purchaseDate.localeCompare(b.purchaseDate) : sort === 'price_desc' ? b.purchasePrice - a.purchasePrice : a.purchasePrice - b.purchasePrice), [items, appliedQuery, category, status, manufacturer, sort]);
  const close = () => { setFormOpen(false); setEditing(undefined); };
  const exportJson = () => { const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `golf-equipment-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); };
  const exportCsv = () => { const csv = equipmentToCsv(items, categoryName, statusName); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `golf-equipment-ledger-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url); };
  const importJson = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = async () => { try { const parsed = parseEquipmentData(JSON.parse(String(reader.result))); if (!parsed.ok) throw new Error(parsed.errors.join(', ')); if (confirm(`${parsed.items.length}件のデータで現在の記録を置き換えます。よろしいですか？`)) await restore(parsed.items); } catch { alert('有効なバックアップJSONを選択してください。データ形式と必須項目を確認してください。'); } finally { if (fileRef.current) fileRef.current.value = ''; } }; reader.readAsText(file); };
  const removeItem = async (item: GolfEquipment) => { if (confirm(`「${item.name}」を削除します。この操作は元に戻せません。`)) await remove(item.id); };
  const categoryOptions = <>{categories.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</>;
  const statusOptions = <>{statuses.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</>;
  const manufacturerOptions = <>{[...new Set([...manufacturers, ...shaftManufacturers])].map(name => <option value={name} key={name}>{name}</option>)}</>;
  const sortOptions = <>{Object.entries(sortLabels).map(([id, name]) => <option value={id} key={id}>{name}</option>)}</>;
  return <main><header><div><p className="brand">等身大ゴルフ</p><h1>ゴルフ用品<span className="mobile-title-break"><br /></span>購入記録</h1></div><div className="header-actions"><button className="text-button" onClick={exportJson}>バックアップ</button><button className="text-button" onClick={() => fileRef.current?.click()}>復元</button><button className="text-button" onClick={exportCsv}>CSV出力</button><input ref={fileRef} className="sr-only" type="file" accept="application/json" onChange={e => importJson(e.target.files?.[0])} /><button className="primary add" disabled={!equipment.ready || equipment.saving} onClick={() => { setEditing(undefined); setFormOpen(true); }}>＋ 新規登録</button></div></header><AuthPanel auth={auth} /><EquipmentStorageStatus source={equipment.source} loading={equipment.loading} saving={equipment.saving} error={equipment.error} onRetry={equipment.reload} /><section className="summary">{[['購入総額', yen(totals.purchase), 'purchase'], ['売却総額', yen(totals.sales), 'sales'], ['実質支出額', yen(totals.net), 'net'], ['所有アイテム数', `${totals.owned}件`, 'owned']].map(([label, value, kind]) => <article className={'summary-card ' + kind} key={label}><p>{label}</p><strong>{value}</strong></article>)}</section><AnalyticsDashboard items={items} /><section className="controls" aria-label="検索と絞り込み"><label className="filter category-filter">カテゴリ<select value={category} onChange={e => setCategory(e.target.value)}><option value="">すべて</option>{categoryOptions}</select></label><label className="filter status-filter">ステータス<select value={status} onChange={e => setStatus(e.target.value)}><option value="">すべて</option>{statusOptions}</select></label><label className="filter manufacturer-filter">メーカー<select value={manufacturer} onChange={e => setManufacturer(e.target.value)}><option value="">すべて</option>{manufacturerOptions}</select></label><div className="search-group"><label className="search">検索<input value={query} onChange={e => setQuery(e.target.value)} placeholder="道具名・メーカーで検索" /></label><button type="button" className="primary search-button" onClick={() => setAppliedQuery(query)}>検索する</button></div></section><section className="list"><div className="list-head"><div><p className="eyebrow">登録アイテム</p><h2>購入記録 <span>{visible.length}件</span></h2></div><label className="sort-control">並び替え<select value={sort} onChange={e => setSort(e.target.value as SortOption)}>{sortOptions}</select></label></div>{visible.length === 0 ? <div className="empty"><h3>該当する用品がありません</h3><p>検索条件を変えるか、右上の「新規登録」から最初の記録を追加してください。</p></div> : <><div className="desktop-table"><table><thead><tr>{['道具名', 'カテゴリ', 'メーカー', '購入日', '購入価格', '売却価格', 'ステータス', '操作'].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{visible.map(i => <tr key={i.id}><td><b>{i.name}</b></td><td>{categoryName(i.categoryId)}</td><td>{i.manufacturer || '—'}</td><td>{date(i.purchaseDate)}</td><td>{yen(i.purchasePrice)}</td><td>{yen(i.salePrice)}</td><td><span className={'status ' + i.status}>{statusName(i.status)}</span></td><td className="row-actions"><button onClick={() => setDetail(i)}>詳細</button><button onClick={() => { setEditing(i); setFormOpen(true); }}>編集</button><button className="danger-link" onClick={() => void removeItem(i)}>削除</button></td></tr>)}</tbody></table></div><div className="mobile-cards">{visible.map(i => <article className="item-card" key={i.id}><div><span className="eyebrow">{categoryName(i.categoryId)}</span><h3>{i.name}</h3><p>{i.manufacturer || 'メーカー未登録'} · {date(i.purchaseDate)}</p></div><span className={'status ' + i.status}>{statusName(i.status)}</span><div className="price-line"><span>購入 {yen(i.purchasePrice)}</span><span>売却 {yen(i.salePrice)}</span></div><div className="card-actions"><button onClick={() => setDetail(i)}>詳細</button><button onClick={() => { setEditing(i); setFormOpen(true); }}>編集</button><button className="danger-link" onClick={() => void removeItem(i)}>削除</button></div></article>)}</div></>}</section>{formOpen && <EquipmentForm item={editing} saving={equipment.saving} onClose={close} onSave={async v => { const saved = editing ? await update(editing.id, v) : await create(v); if (saved) close(); }} />}{detail && <Detail item={detail} onClose={() => setDetail(undefined)} onEdit={() => { setEditing(detail); setDetail(undefined); setFormOpen(true); }} />}</main>;
}
