import { useAuthStore } from '@/store/authStore';

const LIMITS: Record<string, Record<string, number>> = {
  free: { watchlists: 5, alerts: 3, portfolios: 1, signals: 3 },
  pro: { watchlists: Infinity, alerts: 50, portfolios: 10, signals: Infinity },
  institutional: { watchlists: Infinity, alerts: Infinity, portfolios: Infinity, signals: Infinity },
};

export function usePlan() {
  const { plan } = useAuthStore();

  const getLimit = (feature: string): number => {
    return LIMITS[plan || 'free']?.[feature] ?? 0;
  };

  const canUse = (feature: string, currentCount = 0): boolean => {
    const limit = getLimit(feature);
    return currentCount < limit;
  };

  return { plan, getLimit, canUse };
}
