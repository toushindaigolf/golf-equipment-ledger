import type { AppEnvironment } from '../lib/appEnvironment';

export function EnvironmentBanner({ environment }: { environment: AppEnvironment }) {
  if (environment !== 'staging') return null;

  return <aside className="environment-banner" aria-label="テスト環境">
    <strong>STAGING</strong><span aria-hidden="true">｜</span><span>テスト環境</span>
  </aside>;
}

