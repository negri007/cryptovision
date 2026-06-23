import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  plan: string;
  role: string;
  claims: Record<string, any>;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null, claims?: Record<string, any>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  plan: 'free',
  role: 'user',
  claims: {},
  loading: true,
  error: null,
  setUser: (user, claims = {}) => set({ 
    user, 
    claims, 
    plan: claims.plan || 'free',
    role: claims.role || 'user',
    loading: false 
  }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearUser: () => set({ user: null, plan: 'free', role: 'user', claims: {}, error: null }),
}));
