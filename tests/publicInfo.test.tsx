import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppFooter } from '../src/components/AppFooter';
import { PublicInfoDialog, type PublicInfoPage } from '../src/components/PublicInfoDialog';

const renderPage = (page: PublicInfoPage, contactFormUrl: string | null = null) => renderToStaticMarkup(
  <PublicInfoDialog page={page} contactFormUrl={contactFormUrl} onClose={() => undefined} />,
);

describe('public release information', () => {
  it('renders every footer destination', () => {
    const html = renderToStaticMarkup(<AppFooter onOpen={() => undefined} />);
    expect(html).toContain('使い方');
    expect(html).toContain('プライバシーポリシー');
    expect(html).toContain('利用規約');
    expect(html).toContain('問い合わせ');
    expect(html).toContain('データ削除について');
    expect(html).toContain('Free／Proについて');
    expect(html).toContain('href="https://note.com/toushindai_golf"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renders the published privacy and terms guidance', () => {
    const privacy = renderPage('privacy');
    const terms = renderPage('terms');
    expect(privacy).toContain('プライバシーポリシー');
    expect(privacy).toContain('等身大ゴルフ');
    expect(privacy).toContain('2026年8月30日');
    expect(privacy).toContain('2026年9月4日');
    expect(privacy).toContain('Google Analytics 4');
    expect(privacy).toContain('Cookieまたはこれに類する識別子');
    expect(privacy).toContain('用品情報、検索語をアクセス解析用のイベントとして意図的に送信しません');
    expect(privacy).toContain('一律の自動削除期限を設けていません');
    expect(terms).toContain('利用規約');
    expect(terms).toContain('Pro版を購入することはできません');
    expect(terms).toContain('保存データを読み込むと、端末内の現在の記録を置き換えます');
  });

  it('does not render a broken contact link when the URL is missing', () => {
    const html = renderPage('contact');
    expect(html).toContain('問い合わせフォームは準備中です');
    expect(html).not.toContain('href=');
  });

  it('opens a configured contact link in a protected external tab', () => {
    const html = renderPage('contact', 'https://docs.google.com/forms/d/e/example/viewform');
    expect(html).toContain('href="https://docs.google.com/forms/d/e/example/viewform"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('explains how to delete local and cloud data', () => {
    const html = renderPage('deletion', 'https://docs.google.com/forms/d/e/example/viewform');
    expect(html).toContain('ブラウザのサイトデータを削除する');
    expect(html).toContain('即時・自動削除機能は現在提供していません');
    expect(html).toContain('データ削除を依頼する');
  });

  it('explains help and the current Free/Pro transition without offering payment', () => {
    const help = renderPage('help');
    const plans = renderPage('plans');
    expect(help).toContain('端末内データを大切に保管する');
    expect(plans).toContain('購入の傾向を見える化');
    expect(plans).toContain('必要な記録をすぐに発見');
    expect(plans).toContain('Pro版の購入は現在準備中です');
    expect(plans).toContain('Free版は基本的に端末内保存を利用します');
  });
});
