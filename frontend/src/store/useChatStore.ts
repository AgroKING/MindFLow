import { create } from 'zustand';
import { chatService } from '../services/chat.service';
import { socketService, type ChatMessage } from '../lib/socket';

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isTyping: boolean;
    typingUser: string | null;
    isConnected: boolean;

    fetchHistory: (userId?: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    sendMessage: (content: string, attachments?: string[]) => void;
    setTyping: (isTyping: boolean, user?: string) => void;
    setConnected: (connected: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,
    isTyping: false,
    typingUser: null,
    isConnected: false,

    setConnected: (connected) => set({ isConnected: connected }),

    fetchHistory: async (userId) => {
        set({ isLoading: true });
        try {
            const history = await chatService.getHistory(userId);
            set({ messages: history, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch chat history', error);
            set({ isLoading: false });
        }
    },

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    sendMessage: (content, attachments) => {
        const { user } = useAuthStore.getState(); // Access auth store
        if (!user) return;

        const tempId = Date.now().toString();
        const newMessage: ChatMessage = {
            id: tempId,
            content,
            userId: user.id,
            timestamp: new Date().toISOString(),
            attachments
        };

        // Optimistic update
        set((state) => ({ messages: [...state.messages, newMessage] }));

        // Emit via socket
        socketService.sendMessage({
            content,
            userId: user.id,
            attachments
        });
    },

    setTyping: (isTyping, typingUser) => set({ isTyping, typingUser: isTyping ? typingUser : null }),
}));

// Circular dependency workaround if needed, or better architectural separation
// Here we are dynamically importing useAuthStore to avoid circular dependency issues at module level
// or we can expect the caller to handle auth check.
// For now, let's assume useAuthStore is available globally or imported safely.
import { useAuthStore } from './useAuthStore';
