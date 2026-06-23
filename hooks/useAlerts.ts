import { useCollection } from './useFirestore';
import { useAuthStore } from '@/store/authStore';

export function useAlerts() {
  const { user } = useAuthStore();
  const alerts = useCollection<any>(user?.uid ? `users/${user.uid}/alerts` : '');
  return { alerts: alerts.data, loading: alerts.loading };
}
