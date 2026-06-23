import { useCollection } from './useFirestore';
import { useAuthStore } from '@/store/authStore';

export function usePortfolio() {
  const { user } = useAuthStore();
  const portfolios = useCollection<any>(user?.uid ? `users/${user.uid}/portfolios` : '');
  return { portfolios: portfolios.data, loading: portfolios.loading };
}
