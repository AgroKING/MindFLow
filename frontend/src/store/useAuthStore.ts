import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    preferences?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    setAuth: (user: User, token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setAuth: (user, token) => {
                localStorage.setItem('auth_token', token);
                set({ user, token, isAuthenticated: true, error: null });
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                set({ user: null, token: null, isAuthenticated: false, error: null });
            },

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error }),

            updateUser: (userData) => set((state) => ({
                user: state.user ? { ...state.user, ...userData } : null
            })),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
