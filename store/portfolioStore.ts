import { create } from 'zustand';

interface PortfolioState {
  portfolios: any[];
  assets: any[];
  transactions: any[];
  activePortfolioId: string | null;
  setPortfolios: (portfolios: any[]) => void;
  setAssets: (assets: any[]) => void;
  setTransactions: (transactions: any[]) => void;
  setActivePortfolio: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  assets: [],
  transactions: [],
  activePortfolioId: null,
  setPortfolios: (portfolios) => set({ portfolios }),
  setAssets: (assets) => set({ assets }),
  setTransactions: (transactions) => set({ transactions }),
  setActivePortfolio: (id) => set({ activePortfolioId: id }),
}));
