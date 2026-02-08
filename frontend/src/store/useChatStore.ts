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
    sendMessage: (content: string, attachments?: string[]) => Promise<void>;
    setTyping: (isTyping: boolean, user?: string) => void;
    setConnected: (connected: boolean) => void;
    syncOfflineMessages: () => Promise<void>;
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

    sendMessage: async (content, attachments) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const tempId = Date.now().toString();
        const newMessage: ChatMessage = {
            id: tempId,
            content,
            userId: user.id,
            timestamp: new Date().toISOString(),
            attachments,
            status: 'sending' // new status field
        };

        // 1. Optimistic Update
        set((state) => ({ messages: [...state.messages, newMessage] }));

        // 2. Persist to Queue (Offline Safety)
        const currentQueue = JSON.parse(localStorage.getItem('chat_queue') || '[]');
        localStorage.setItem('chat_queue', JSON.stringify([...currentQueue, newMessage]));

        try {
            // 3. Attempt Send
            await socketService.sendMessage({
                content,
                userId: user.id,
                attachments
            });

            // 4. Success - Remove from Queue & Update Status
            const updatedQueue = JSON.parse(localStorage.getItem('chat_queue') || '[]').filter((m: ChatMessage) => m.id !== tempId);
            localStorage.setItem('chat_queue', JSON.stringify(updatedQueue));

            set((state) => ({
                messages: state.messages.map(m => m.id === tempId ? { ...m, status: 'sent' } : m)
            }));

        } catch (error) {
            console.warn('Message send failed, queued for retry', error);
            // Keep in queue, update UI to show error/retry state if needed
            set((state) => ({
                messages: state.messages.map(m => m.id === tempId ? { ...m, status: 'error' } : m)
            }));
        }
    },

    syncOfflineMessages: async () => {
        const queue: ChatMessage[] = JSON.parse(localStorage.getItem('chat_queue') || '[]');
        if (queue.length === 0) return;

        const { user } = useAuthStore.getState();
        if (!user) return;

        console.log(`Syncing ${queue.length} offline messages...`);

        const remainingQueue: ChatMessage[] = [];

        for (const msg of queue) {
            try {
                await socketService.sendMessage({
                    content: msg.content,
                    userId: msg.userId,
                    attachments: msg.attachments
                });
                // Update UI to show sent
                set((state) => ({
                    messages: state.messages.map(m => m.id === msg.id ? { ...m, status: 'sent' } : m)
                }));
            } catch (error) {
                console.error('Failed to sync message', msg.id);
                remainingQueue.push(msg);
            }
        }

        localStorage.setItem('chat_queue', JSON.stringify(remainingQueue));
    },

    setTyping: (isTyping, typingUser) => set({ isTyping, typingUser: isTyping ? typingUser : null }),
}));

// Circular dependency workaround if needed, or better architectural separation
// Here we are dynamically importing useAuthStore to avoid circular dependency issues at module level
// or we can expect the caller to handle auth check.
// For now, let's assume useAuthStore is available globally or imported safely.
import { useAuthStore } from './useAuthStore';
