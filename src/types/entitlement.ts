export type EntitlementPlan = 'free' | 'pro';
export type EntitlementStatus = 'active' | 'inactive' | 'canceled' | 'expired';
export type EntitlementSource = 'manual' | 'stripe' | 'other';

export type Entitlement = {
  id: string;
  userId: string;
  plan: EntitlementPlan;
  status: EntitlementStatus;
  source: EntitlementSource;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EntitlementAccessStatus = 'loading' | 'free' | 'pro' | 'error';
