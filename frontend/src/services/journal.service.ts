import api from '../lib/api';

export const journalService = {
    async getEntries(params?: any) {
        const response = await api.get('/journal', { params });
        return response.data;
    },

    async getEntry(id: string) {
        const response = await api.get(`/journal/${id}`);
        return response.data;
    },

    async createEntry(data: any) {
        const response = await api.post('/journal', data);
        return response.data;
    },

    async updateEntry(id: string, data: any) {
        const response = await api.put(`/journal/${id}`, data);
        return response.data;
    },

    async deleteEntry(id: string) {
        const response = await api.delete(`/journal/${id}`);
        return response.data;
    }
};
