import api from '../lib/api';

const STORAGE_KEY = 'mindflow_journal_entries';

// Helper to get local entries
const getLocalEntries = (): any[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to read from localStorage', e);
        return [];
    }
};

// Helper to save local entries
const saveLocalEntries = (entries: any[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
        console.error('Failed to save to localStorage', e);
    }
};

export const journalService = {
    async getEntries(params?: any) {
        try {
            const response = await api.get('/journal', { params });
            return response.data;
        } catch (error) {
            console.warn('Backend unavailable, falling back to localStorage');
            let entries = getLocalEntries();
            // Basic filtering if params exist (search/tags)
            if (params?.search) {
                const search = params.search.toLowerCase();
                entries = entries.filter((e: any) =>
                    e.title.toLowerCase().includes(search) ||
                    e.content.toLowerCase().includes(search)
                );
            }
            // Sort by date desc
            return entries.sort((a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        }
    },

    async getEntry(id: string) {
        try {
            const response = await api.get(`/journal/${id}`);
            return response.data;
        } catch (error) {
            const entry = getLocalEntries().find((e: any) => e.id === id);
            if (!entry) throw new Error('Entry not found locally');
            return entry;
        }
    },

    async createEntry(data: any) {
        try {
            const response = await api.post('/journal', data);
            return response.data;
        } catch (error) {
            console.warn('Backend unavailable, saving to localStorage');
            const entries = getLocalEntries();
            const newEntry = {
                ...data,
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
            };
            entries.unshift(newEntry);
            saveLocalEntries(entries);
            return newEntry;
        }
    },

    async updateEntry(id: string, data: any) {
        try {
            const response = await api.put(`/journal/${id}`, data);
            return response.data;
        } catch (error) {
            const entries = getLocalEntries();
            const index = entries.findIndex((e: any) => e.id === id);
            if (index === -1) throw new Error('Entry not found locally');

            const updatedEntry = { ...entries[index], ...data };
            entries[index] = updatedEntry;
            saveLocalEntries(entries);
            return updatedEntry;
        }
    },

    async deleteEntry(id: string) {
        try {
            const response = await api.delete(`/journal/${id}`);
            return response.data;
        } catch (error) {
            const entries = getLocalEntries();
            const filtered = entries.filter((e: any) => e.id !== id);
            saveLocalEntries(filtered);
            return { success: true };
        }
    }
};
