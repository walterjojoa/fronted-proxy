import { Building2, Rocket, Zap } from 'lucide-react';

// Mirrors the Plan enum of the backend. null means unlimited.
export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: 0,
    requestsPerMinute: 10,
    monthlyTokens: 50_000,
    icon: Zap,
    tagline: 'To try the platform',
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 19,
    requestsPerMinute: 60,
    monthlyTokens: 500_000,
    icon: Rocket,
    tagline: 'For developers and small teams',
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 99,
    requestsPerMinute: null,
    monthlyTokens: null,
    icon: Building2,
    tagline: 'No limits for large workloads',
  },
};

export const PLAN_ORDER = ['FREE', 'PRO', 'ENTERPRISE'];

export function plansAbove(planId) {
  return PLAN_ORDER.slice(PLAN_ORDER.indexOf(planId) + 1).map((id) => PLANS[id]);
}
