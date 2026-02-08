import { create } from 'zustand';
import { journalService } from '../services/journal.service';

export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    date: string;
    tags?: string[];
    moodScore?: number;
    mood?: string;
}

interface JournalState {
    entries: JournalEntry[];
    currentEntry: JournalEntry | null;
    isLoading: boolean;
    error: string | null;

    fetchEntries: (params?: any) => Promise<void>;
    fetchEntry: (id: string) => Promise<void>;
    addEntry: (data: any) => Promise<void>;
    updateEntry: (id: string, data: any) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    setCurrentEntry: (entry: JournalEntry | null) => void;
}

export const useJournalStore = create<JournalState>((set) => ({
    entries: [],
    currentEntry: null,
    isLoading: false,
    error: null,

    setCurrentEntry: (entry) => set({ currentEntry: entry }),

    fetchEntries: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const data = await journalService.getEntries(params);
            set({ entries: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch entries', isLoading: false });
        }
    },

    fetchEntry: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const entry = await journalService.getEntry(id);
            set({ currentEntry: entry, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch entry', isLoading: false });
        }
    },

    addEntry: async (data) => {
        // Create optimistic entry with temporary ID
        const optimisticEntry: JournalEntry = {
            id: `temp-${Date.now()}`,
            title: data.title || 'Untitled Entry',
            content: data.content || '',
            date: data.date || new Date().toISOString(),
            tags: data.tags || [],
            mood: data.mood || '😐',
            moodScore: data.moodScore
        };

        // Immediately add to UI (optimistic update)
        set((state) => ({
            entries: [optimisticEntry, ...state.entries],
            currentEntry: optimisticEntry,
            isLoading: false
        }));

        // Save to backend in background
        try {
            const newEntry = await journalService.createEntry(data);

            // Replace optimistic entry with real entry from server
            set((state) => ({
                entries: state.entries.map(e =>
                    e.id === optimisticEntry.id ? newEntry : e
                ),
                currentEntry: newEntry,
                error: null
            }));
        } catch (error: any) {
            // On error, remove the optimistic entry and show error
            set((state) => ({
                entries: state.entries.filter(e => e.id !== optimisticEntry.id),
                currentEntry: null,
                error: error.message || 'Failed to create entry'
            }));
            throw error;
        }
    },

    updateEntry: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedEntry = await journalService.updateEntry(id, data);
            set((state) => ({
                entries: state.entries.map(e => e.id === id ? updatedEntry : e),
                currentEntry: updatedEntry,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to update entry', isLoading: false });
            throw error;
        }
    },

    deleteEntry: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await journalService.deleteEntry(id);
            set((state) => ({
                entries: state.entries.filter(e => e.id !== id),
                currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete entry', isLoading: false });
            throw error;
        }
    }
}));
