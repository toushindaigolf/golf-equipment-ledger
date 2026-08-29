import { useEffect, useRef, useState } from 'react';

export function HeaderActions({
  addDisabled,
  csvLocked,
  onAdd,
  onBackup,
  onCsv,
  onRestore,
}: {
  addDisabled: boolean;
  csvLocked: boolean;
  onAdd: () => void;
  onBackup: () => void;
  onCsv: () => void;
  onRestore: (file?: File) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const backup = () => {
    setMenuOpen(false);
    onBackup();
  };
  const restore = () => {
    setMenuOpen(false);
    fileRef.current?.click();
  };
  const csv = () => {
    setMenuOpen(false);
    onCsv();
  };

  return <div className="header-actions">
    <div className="desktop-data-actions" aria-label="データ操作">
      <button className="text-button" type="button" onClick={onBackup}>データを保存</button>
      <button className="text-button" type="button" onClick={() => fileRef.current?.click()}>保存データを読み込む</button>
      <button className={`text-button${csvLocked ? ' pro-locked' : ''}`} type="button" onClick={onCsv}>CSV出力</button>
    </div>

    <button className="primary add" type="button" disabled={addDisabled} onClick={onAdd}>＋ 新規登録</button>

    <div className="mobile-data-menu" ref={menuRef}>
      <button
        className="data-menu-trigger"
        type="button"
        aria-label="データ操作メニュー"
        aria-expanded={menuOpen}
        aria-controls="mobile-data-menu-popover"
        onClick={() => setMenuOpen(current => !current)}
      >
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
      </button>
      {menuOpen && <div className="data-menu-popover" id="mobile-data-menu-popover" role="menu">
        <p>データ操作</p>
        <button type="button" role="menuitem" onClick={backup}>データを保存</button>
        <button type="button" role="menuitem" onClick={restore}>保存データを読み込む</button>
        <button type="button" role="menuitem" className={csvLocked ? 'pro-locked' : ''} onClick={csv}>
          CSV出力{csvLocked && <span>Pro</span>}
        </button>
      </div>}
    </div>

    <input
      ref={fileRef}
      className="sr-only"
      type="file"
      accept="application/json"
      onChange={event => {
        onRestore(event.target.files?.[0]);
        event.target.value = '';
      }}
    />
  </div>;
}
