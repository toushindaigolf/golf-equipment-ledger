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
    expect(html).toContain('Free／Proについて');
  });

  it('renders privacy and terms without inventing operator details', () => {
    const privacy = renderPage('privacy');
    const terms = renderPage('terms');
    expect(privacy).toContain('プライバシーポリシー');
    expect(privacy).toContain('[要入力：運営者名]');
    expect(privacy).toContain('アカウント削除機能は実装していません');
    expect(terms).toContain('利用規約');
    expect(terms).toContain('現在はStripe決済を提供しておらず');
    expect(terms).toContain('[要確認：専門家確認]');
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

  it('explains help and the current Free/Pro transition without offering payment', () => {
    const help = renderPage('help');
    const plans = renderPage('plans');
    expect(help).toContain('移行前にもデータを保存する');
    expect(plans).toContain('現在は決済機能を実装していないため、購入することはできません');
    expect(plans).toContain('ログイン済みのFreeユーザーもクラウド保存を利用できます');
  });
});
