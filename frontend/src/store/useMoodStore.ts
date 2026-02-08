import { create } from 'zustand';
import { moodService } from '../services/mood.service';

interface Mood {
    id: string;
    date: string;
    score: number;
    notes?: string;
    tags?: string[];
}

interface MoodState {
    moods: Mood[];
    currentMood: Mood | null;
    isLoading: boolean;
    error: string | null;

    fetchMoods: (params?: any) => Promise<void>;
    addMood: (data: any) => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
    moods: [],
    currentMood: null,
    isLoading: false,
    error: null,

    setLoading: (loading) => set({ isLoading: loading }),

    fetchMoods: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const data = await moodService.getMoodHistory(params);
            set({ moods: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch moods', isLoading: false });
        }
    },

    addMood: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const newMood = await moodService.createMood(data);
            set((state) => ({
                moods: [newMood, ...state.moods],
                currentMood: newMood,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to add mood', isLoading: false });
            throw error;
        }
    }
}));
