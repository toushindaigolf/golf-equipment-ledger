import { afterEach, describe, expect, it } from 'vitest';
import { initializeGa4, isGa4Enabled, trackGa4Event, trackProNoticeView, type Ga4Configuration } from '../src/lib/ga4';

const productionConfiguration: Ga4Configuration = {
  appEnvironment: 'production',
  enabled: 'true',
  measurementId: 'G-TEST123',
};

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
});

describe('GA4 configuration', () => {
  it('enables measurement only for an explicitly enabled production environment', () => {
    expect(isGa4Enabled(productionConfiguration)).toBe(true);
    expect(isGa4Enabled({ ...productionConfiguration, appEnvironment: 'staging' })).toBe(false);
    expect(isGa4Enabled({ ...productionConfiguration, appEnvironment: 'local' })).toBe(false);
    expect(isGa4Enabled({ ...productionConfiguration, enabled: 'false' })).toBe(false);
    expect(isGa4Enabled({ ...productionConfiguration, measurementId: '' })).toBe(false);
    expect(isGa4Enabled({ ...productionConfiguration, measurementId: 'invalid' })).toBe(false);
  });

  it('initializes safely, sends one page view, and accepts only fixed event data', () => {
    const appendedScripts: Array<Record<string, unknown>> = [];
    let scriptLoadingFails = true;
    const fakeWindow = { location: { origin: 'https://example.test', pathname: '/' } };
    const fakeDocument = {
      title: 'ゴルフ用品購入記録',
      getElementById: () => null,
      createElement: () => ({}),
      head: { appendChild: (script: Record<string, unknown>) => {
        if (scriptLoadingFails) throw new Error('blocked');
        appendedScripts.push(script);
      } },
    };
    Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: fakeDocument });

    expect(initializeGa4({ ...productionConfiguration, enabled: 'false' })).toBe(false);
    expect('dataLayer' in fakeWindow).toBe(false);
    expect(initializeGa4(productionConfiguration)).toBe(false);
    scriptLoadingFails = false;
    expect(initializeGa4(productionConfiguration)).toBe(true);
    expect(initializeGa4(productionConfiguration)).toBe(false);
    trackGa4Event({ name: 'help_open' });
    trackGa4Event({ name: 'contact_click' });
    trackGa4Event({ name: 'backup_download' });
    trackGa4Event({ name: 'pro_feature_attempt', feature_name: 'detailed_analytics' });
    trackProNoticeView('csv_export');
    trackProNoticeView('csv_export');

    expect(appendedScripts).toHaveLength(1);
    expect(appendedScripts[0].src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    const events = (fakeWindow as typeof fakeWindow & { dataLayer: unknown[][] }).dataLayer;
    expect(events.filter(entry => entry[0] === 'event' && entry[1] === 'page_view')).toHaveLength(1);
    expect(events).toContainEqual(['event', 'help_open']);
    expect(events).toContainEqual(['event', 'contact_click']);
    expect(events).toContainEqual(['event', 'backup_download']);
    expect(events).toContainEqual(['event', 'pro_feature_attempt', { feature_name: 'detailed_analytics' }]);
    expect(events.filter(entry => entry[0] === 'event' && entry[1] === 'pro_notice_view')).toHaveLength(1);
    expect(JSON.stringify(events)).not.toMatch(/email|user_id|equipment_name|manufacturer|purchase_price|memo|search_keyword/i);
  });
});
