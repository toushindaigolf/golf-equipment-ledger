import { describe, expect, it } from 'vitest';
import { canUseFeature, featurePolicy } from '../src/lib/featurePolicy';

describe('Free / Pro feature policy', () => {
  it('locks paid UI features for Free', () => {
    expect(canUseFeature('analytics', false)).toBe(false);
    expect(canUseFeature('csv_export', false)).toBe(false);
    expect(canUseFeature('advanced_filters', false)).toBe(false);
    expect(canUseFeature('equipment_migration', false)).toBe(false);
  });

  it('unlocks paid UI features for Pro', () => {
    expect(canUseFeature('analytics', true)).toBe(true);
    expect(canUseFeature('csv_export', true)).toBe(true);
    expect(canUseFeature('advanced_filters', true)).toBe(true);
    expect(canUseFeature('equipment_migration', true)).toBe(true);
  });

  it('keeps cloud storage available during the migration period', () => {
    expect(featurePolicy.cloud_storage).toBe('transition');
    expect(canUseFeature('cloud_storage', false)).toBe(true);
  });
});
