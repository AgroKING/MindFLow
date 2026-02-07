import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white/80 backdrop-blur-xl p-4">
            <div className="flex items-end gap-3">
                <Button type="button" variant="ghost" size="icon" className="text-gray-400 shrink-0">
                    <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        style={{ maxHeight: '120px' }}
                    />
                </div>

                <Button type="button" variant="ghost" size="icon" className="text-gray-400 shrink-0">
                    <Mic className="h-5 w-5" />
                </Button>

                <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || disabled}
                    className={cn(
                        "shrink-0 transition-all",
                        message.trim()
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                            : "bg-gray-200 text-gray-400"
                    )}
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </form>
    );
};
