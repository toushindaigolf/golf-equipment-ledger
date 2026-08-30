import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EnvironmentBanner } from '../src/components/EnvironmentBanner';
import { normalizeAppEnvironment } from '../src/lib/appEnvironment';

describe('application environment', () => {
  it('normalizes supported names and safely defaults to production', () => {
    expect(normalizeAppEnvironment(' staging ')).toBe('staging');
    expect(normalizeAppEnvironment('LOCAL')).toBe('local');
    expect(normalizeAppEnvironment('production')).toBe('production');
    expect(normalizeAppEnvironment(undefined)).toBe('production');
    expect(normalizeAppEnvironment('unknown')).toBe('production');
  });

  it('renders the warning only for staging', () => {
    expect(renderToStaticMarkup(<EnvironmentBanner environment="staging" />))
      .toContain('STAGING');
    expect(renderToStaticMarkup(<EnvironmentBanner environment="staging" />))
      .toContain('テスト環境');
    expect(renderToStaticMarkup(<EnvironmentBanner environment="production" />))
      .toBe('');
    expect(renderToStaticMarkup(<EnvironmentBanner environment="local" />))
      .toBe('');
  });
});
