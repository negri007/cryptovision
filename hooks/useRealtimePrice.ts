import { useEffect, useState } from 'react';
import { subscribeToDoc } from '@/lib/firebase/firestore';
import { useAuthStore } from '@/store/authStore';

interface PriceData {
  priceUsd: number;
  change24h: number;
  fetchedAt: any;
}

export function useRealtimePrice(symbol: string) {
  const [price, setPrice] = useState<PriceData | null>(null);
  const { plan } = useAuthStore();

  useEffect(() => {
    if (!symbol) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const unsubscribe = subscribeToDoc<PriceData>(`market/crypto/prices/${symbol}`, (data) => {
      if (!data) return;
      
      if (plan === 'free') {
        timeoutId = setTimeout(() => {
          setPrice(data);
        }, 15 * 60 * 1000);
      } else {
        setPrice(data);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [symbol, plan]);

  return price;
}
