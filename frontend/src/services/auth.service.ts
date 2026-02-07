import api from '../lib/api';

export const authService = {
    async login(credentials: any) {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    async signup(data: any) {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
        }
    },

    async refreshToken(token: string) {
        const response = await api.post('/auth/refresh', { refresh_token: token });
        return response.data;
    }
};
