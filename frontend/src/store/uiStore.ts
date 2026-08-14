import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  searchQuery: string;
  snackbar: { open: boolean; message: string; severity: 'success' | 'info' | 'error' };
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'error') => void;
  hideSnackbar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  searchQuery: '',
  snackbar: { open: false, message: '', severity: 'success' },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  showSnackbar: (message, severity = 'success') =>
    set({ snackbar: { open: true, message, severity } }),
  hideSnackbar: () =>
    set((s) => ({ snackbar: { ...s.snackbar, open: false } })),
}));
