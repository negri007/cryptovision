import { create } from 'zustand';

interface MarketData {
  priceUsd: number;
  change24h: number;
}

interface MarketState {
  cryptoPrices: Record<string, MarketData>;
  stockPrices: Record<string, MarketData>;
  globalData: any;
  fearGreed: any;
  updatePrice: (symbol: string, type: 'crypto' | 'stock', data: MarketData) => void;
  updateGlobal: (data: any) => void;
  updateFearGreed: (data: any) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  cryptoPrices: {},
  stockPrices: {},
  globalData: null,
  fearGreed: null,
  updatePrice: (symbol, type, data) => set((state) => ({
    [type === 'crypto' ? 'cryptoPrices' : 'stockPrices']: {
      ...state[type === 'crypto' ? 'cryptoPrices' : 'stockPrices'],
      [symbol]: data,
    }
  })),
  updateGlobal: (data) => set({ globalData: data }),
  updateFearGreed: (data) => set({ fearGreed: data }),
}));
