import { useDocument } from './useFirestore';

export function useMarketData() {
  const globalData = useDocument<any>('market/global');
  return { globalData: globalData.data, loading: globalData.loading };
}
