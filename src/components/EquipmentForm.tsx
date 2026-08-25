import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { categories } from '../data/categories';
import { manufacturers } from '../data/manufacturers';
import { shaftManufacturers } from '../data/shaftManufacturers';
import { statuses } from '../data/statuses';
import type { EquipmentInput, EquipmentStatus, GolfEquipment } from '../types/equipment';

const empty: EquipmentInput = { name: '', categoryId: 'driver', manufacturer: '', purchaseDate: new Date().toISOString().slice(0, 10), purchasePrice: 0, purchasePlace: '', purchaseReason: '', salePrice: 0, saleDate: '', status: 'in_use', memo: '' };
const isShaftManufacturer = (value: string) => shaftManufacturers.includes(value as typeof shaftManufacturers[number]) && value !== 'その他';

export function EquipmentForm({ item, saving = false, onSave, onClose }: { item?: GolfEquipment; saving?: boolean; onSave: (v: EquipmentInput) => void | Promise<void>; onClose: () => void }) {
  const initial = item ? (({ id, createdAt, updatedAt, ...value }) => value)(item) : empty;
  const [form, setForm] = useState<EquipmentInput>(initial);
  const [shaftOther, setShaftOther] = useState(item?.categoryId === 'shaft' && Boolean(item.manufacturer) && !isShaftManufacturer(item.manufacturer));
  const [customShaftManufacturer, setCustomShaftManufacturer] = useState(item?.categoryId === 'shaft' && item.manufacturer !== 'その他' ? item.manufacturer : '');
  const panelRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const next = item ? (({ id, createdAt, updatedAt, ...value }) => value)(item) : empty;
    setForm(next);
    setShaftOther(next.categoryId === 'shaft' && Boolean(next.manufacturer) && !isShaftManufacturer(next.manufacturer));
    setCustomShaftManufacturer(next.categoryId === 'shaft' && next.manufacturer !== 'その他' ? next.manufacturer : '');
  }, [item]);

  useLayoutEffect(() => {
    const reset = () => { const active = document.activeElement; if (active instanceof HTMLElement) active.blur(); panelRef.current?.scrollTo({ top: 0, behavior: 'auto' }); };
    reset();
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, []);

  const set = (key: keyof EquipmentInput, value: string | number) => setForm(current => ({ ...current, [key]: value }));
  const numericValue = (value: number) => value === 0 ? '' : String(value);
  const shaftCategory = form.categoryId === 'shaft';
  const displayedManufacturer = shaftCategory && shaftOther ? 'その他' : form.manufacturer;
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!saving) void onSave({ ...form, manufacturer: shaftCategory && shaftOther ? customShaftManufacturer || 'その他' : form.manufacturer }); };
  const changeCategory = (value: string) => { set('categoryId', value); if (value !== 'shaft') { setShaftOther(false); setCustomShaftManufacturer(''); } else if (form.manufacturer === 'その他') { setShaftOther(true); setCustomShaftManufacturer(''); } else if (form.manufacturer && !isShaftManufacturer(form.manufacturer)) { setShaftOther(true); setCustomShaftManufacturer(form.manufacturer); } else { setShaftOther(false); setCustomShaftManufacturer(''); } };
  const changeShaftManufacturer = (value: string) => { const other = value === 'その他'; setShaftOther(other); if (other) { setCustomShaftManufacturer(customShaftManufacturer || (isShaftManufacturer(form.manufacturer) ? '' : form.manufacturer)); set('manufacturer', 'その他'); } else set('manufacturer', value); };

  return <div className="overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><form ref={panelRef} className="panel" onSubmit={submit} aria-label={item ? '用品を編集' : '用品を登録'}><div className="panel-head"><div><p className="eyebrow">{item ? '編集' : '新規登録'}</p><h2>{item ? '用品を編集' : '購入した用品を記録'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="閉じる">×</button></div><div className="form-grid"><label className="wide">道具名 <b>必須</b><input required value={form.name} onChange={event => set('name', event.target.value)} placeholder="例：ドライバー" /></label><label>カテゴリ <b>必須</b><select value={form.categoryId} onChange={event => changeCategory(event.target.value)}>{categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>{shaftCategory ? 'シャフトメーカー' : 'メーカー'}<select value={displayedManufacturer} onChange={event => shaftCategory ? changeShaftManufacturer(event.target.value) : set('manufacturer', event.target.value)}><option value="">メーカーを選択</option>{shaftCategory ? shaftManufacturers.map(name => <option key={name} value={name}>{name}</option>) : <>{form.manufacturer && !manufacturers.includes(form.manufacturer as typeof manufacturers[number]) && <option value={form.manufacturer}>{form.manufacturer}</option>}{manufacturers.map(name => <option key={name} value={name}>{name}</option>)}</>}</select>{shaftCategory && shaftOther && <input value={customShaftManufacturer} onChange={event => setCustomShaftManufacturer(event.target.value)} placeholder="シャフトメーカー名を入力" aria-label="その他のシャフトメーカー名" />}</label><label>購入日 <b>必須</b><input required type="date" value={form.purchaseDate} onChange={event => set('purchaseDate', event.target.value)} /></label><label>購入価格 <b>必須</b><input required min="0" inputMode="numeric" type="number" value={numericValue(form.purchasePrice)} onChange={event => set('purchasePrice', event.target.value === '' ? 0 : Number(event.target.value))} /></label><label>ステータス <b>必須</b><select value={form.status as EquipmentStatus} onChange={event => set('status', event.target.value)}>{statuses.map(status => <option key={status.id} value={status.id}>{status.name}</option>)}</select></label><label>売却価格<input min="0" inputMode="numeric" type="number" value={numericValue(form.salePrice)} onChange={event => set('salePrice', event.target.value === '' ? 0 : Number(event.target.value))} /><small>未売却は 0 円。入力した売却額はステータスにかかわらず集計します。</small></label><label>売却日<input type="date" value={form.saleDate} onChange={event => set('saleDate', event.target.value)} /><small>売却済みの場合に入力してください。</small></label><label>購入場所<input value={form.purchasePlace} onChange={event => set('purchasePlace', event.target.value)} /></label><label>購入理由<input value={form.purchaseReason} onChange={event => set('purchaseReason', event.target.value)} /></label><label className="wide">メモ<textarea rows={3} value={form.memo} onChange={event => set('memo', event.target.value)} /></label></div><div className="form-actions"><button type="button" className="secondary" onClick={onClose}>キャンセル</button><button className="primary">{item ? '保存する' : '登録する'}</button></div></form></div>;
}
