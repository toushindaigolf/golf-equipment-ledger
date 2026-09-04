import type { AppEnvironment } from './appEnvironment';

export type Ga4FeatureName =
  | 'detailed_analytics'
  | 'csv_export'
  | 'advanced_filters'
  | 'equipment_migration';

export type Ga4Event =
  | { name: 'help_open' }
  | { name: 'privacy_policy_open' }
  | { name: 'terms_open' }
  | { name: 'contact_click' }
  | { name: 'backup_download' }
  | { name: 'sign_up' }
  | { name: 'login' }
  | { name: 'logout' }
  | { name: 'pro_notice_view'; feature_name: Ga4FeatureName }
  | { name: 'pro_feature_attempt'; feature_name: Ga4FeatureName };

export type Ga4Configuration = {
  appEnvironment: AppEnvironment;
  enabled: string | undefined;
  measurementId: string | undefined;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let initialPageViewSent = false;
const viewedProNotices = new Set<Ga4FeatureName>();

export function normalizeMeasurementId(value: string | undefined): string | null {
  const normalized = value?.trim().toUpperCase();
  return normalized && /^G-[A-Z0-9]+$/.test(normalized) ? normalized : null;
}

export function isGa4Enabled(configuration: Ga4Configuration): boolean {
  return configuration.appEnvironment === 'production'
    && configuration.enabled?.trim().toLowerCase() === 'true'
    && normalizeMeasurementId(configuration.measurementId) !== null;
}

function currentConfiguration(): Ga4Configuration {
  const configuredEnvironment = import.meta.env.VITE_APP_ENV?.trim().toLowerCase();
  return {
    appEnvironment: configuredEnvironment === 'production'
      ? 'production'
      : configuredEnvironment === 'staging'
        ? 'staging'
        : 'local',
    enabled: import.meta.env.VITE_GA_ENABLED,
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  };
}

export function initializeGa4(configuration: Ga4Configuration = currentConfiguration()): boolean {
  if (initialized || !isGa4Enabled(configuration) || typeof window === 'undefined' || typeof document === 'undefined') return false;

  const measurementId = normalizeMeasurementId(configuration.measurementId);
  if (!measurementId) return false;

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));

    const scriptId = 'ga4-gtag-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }

    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });
    initialized = true;

    if (!initialPageViewSent) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: `${window.location.origin}${window.location.pathname}`,
        page_path: window.location.pathname,
      });
      initialPageViewSent = true;
    }
    return true;
  } catch {
    return false;
  }
}

export function trackGa4Event(event: Ga4Event): void {
  if (!initialized || typeof window === 'undefined' || !window.gtag) return;
  try {
    if ('feature_name' in event) {
      window.gtag('event', event.name, { feature_name: event.feature_name });
      return;
    }
    window.gtag('event', event.name);
  } catch {
    // Analytics must never block or break an application operation.
  }
}

export function trackProNoticeView(featureName: Ga4FeatureName): void {
  if (viewedProNotices.has(featureName)) return;
  viewedProNotices.add(featureName);
  trackGa4Event({ name: 'pro_notice_view', feature_name: featureName });
}
