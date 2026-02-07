import { create } from 'zustand';

interface AppState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    // Theme preference could go here, but we are using CSS variables/Tailwind for now
}

export const useAppStore = create<AppState>((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
