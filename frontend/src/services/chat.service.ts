import api from '../lib/api';

export const chatService = {
    async getHistory(userId?: string) {
        const params = userId ? { userId } : {};
        const response = await api.get('/chat/history', { params });
        return response.data;
    },

    async getAIResponse(message: string) {
        const response = await api.post('/chat/ai-response', { message });
        return response.data;
    },

    async uploadAttachment(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
