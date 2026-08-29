export type AppFeature =
  | 'analytics'
  | 'csv_export'
  | 'advanced_filters'
  | 'equipment_migration'
  | 'cloud_storage'
  | 'ad_free';

export type FeatureAccess = 'free' | 'pro' | 'transition';

export const featurePolicy: Record<AppFeature, FeatureAccess> = {
  analytics: 'pro',
  csv_export: 'pro',
  advanced_filters: 'pro',
  equipment_migration: 'pro',
  cloud_storage: 'transition',
  ad_free: 'pro',
};

export const canUseFeature = (feature: AppFeature, isPro: boolean) =>
  featurePolicy[feature] !== 'pro' || isPro;
