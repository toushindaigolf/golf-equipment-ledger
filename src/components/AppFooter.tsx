import type { PublicInfoPage } from './PublicInfoDialog';

const links: Array<[PublicInfoPage, string]> = [
  ['help', '使い方'],
  ['privacy', 'プライバシーポリシー'],
  ['terms', '利用規約'],
  ['contact', '問い合わせ'],
  ['plans', 'Free／Proについて'],
];

export function AppFooter({ onOpen }: { onOpen: (page: PublicInfoPage) => void }) {
  return <footer className="app-footer">
    <p><strong><a href="https://note.com/toushindai_golf" target="_blank" rel="noopener noreferrer">等身大ゴルフ</a></strong><span>ゴルフ用品の購入・売却履歴を記録・管理できるWebアプリです。</span></p>
    <nav aria-label="アプリ情報">
      {links.map(([page, label]) => <button type="button" key={page} onClick={() => onOpen(page)}>{label}</button>)}
    </nav>
  </footer>;
}
