import api from '../lib/api';

export const moodService = {
    async createMood(data: any) {
        const response = await api.post('/mood', data);
        return response.data;
    },

    async getMoodHistory(params?: any) {
        const response = await api.get('/mood/history', { params });
        return response.data;
    },

    async getMoodStats() {
        const response = await api.get('/mood/stats');
        return response.data;
    }
};
