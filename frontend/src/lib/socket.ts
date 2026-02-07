import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000';

export interface ChatMessage {
    id: string;
    content: string;
    userId: string;
    timestamp: string;
    sessionId?: string;
    attachments?: string[];
}

export interface TypingEvent {
    userId: string;
    isTyping: boolean;
}

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    connect(token: string) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from WebSocket:', reason);
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('Socket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // --- Chat Specific Methods ---

    joinRoom(roomId: string) {
        this.socket?.emit('join_room', { roomId });
    }

    leaveRoom(roomId: string) {
        this.socket?.emit('leave_room', { roomId });
    }

    sendMessage(message: Partial<ChatMessage>) {
        this.socket?.emit('send_message', message);
    }

    sendTyping(isTyping: boolean, roomId?: string) {
        this.socket?.emit('typing', { isTyping, roomId });
    }

    // --- Event Listeners ---

    onMessage(callback: (message: ChatMessage) => void) {
        this.socket?.on('new_message', callback);
    }

    onTyping(callback: (data: TypingEvent) => void) {
        this.socket?.on('user_typing', callback);
    }

    // Cleanup listeners to prevent duplicates if component remounts
    offMessage(callback?: (message: ChatMessage) => void) {
        if (callback) {
            this.socket?.off('new_message', callback);
        } else {
            this.socket?.off('new_message');
        }
    }

    offTyping(callback?: (data: TypingEvent) => void) {
        if (callback) {
            this.socket?.off('user_typing', callback);
        } else {
            this.socket?.off('user_typing');
        }
    }
}

export const socketService = SocketService.getInstance();
