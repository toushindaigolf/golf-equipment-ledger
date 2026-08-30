export type AppEnvironment = 'production' | 'staging' | 'local';

export function normalizeAppEnvironment(value: string | undefined): AppEnvironment {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'staging' || normalized === 'local') return normalized;
  return 'production';
}

export const appEnvironment = normalizeAppEnvironment(import.meta.env.VITE_APP_ENV);

