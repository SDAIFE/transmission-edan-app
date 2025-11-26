import { create } from 'zustand';

/**
 * Store Zustand pour l'UI
 */

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));

// Alias pour compatibilité
export const useSidebar = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  return {
    isOpen: sidebarOpen,
    toggle: toggleSidebar,
    setOpen: setSidebarOpen,
  };
};

