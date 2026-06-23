import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeModal: null,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setTheme: (theme) => set({ theme }),
}));
