import api from '../lib/api';

export const activitiesService = {
    async getActivities() {
        const response = await api.get('/activities');
        return response.data;
    },

    async markComplete(id: string) {
        const response = await api.post(`/activities/${id}/complete`);
        return response.data;
    },

    async getRecommendations() {
        const response = await api.get('/activities/recommendations');
        return response.data;
    }
};
