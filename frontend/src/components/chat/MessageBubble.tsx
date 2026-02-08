import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
                "flex flex-col max-w-[80%] md:max-w-[60%]",
                isUser ? "self-end items-end" : "self-start items-start"
            )}
        >
            <div
                className={cn(
                    "px-4 py-3 rounded-2xl shadow-sm",
                    isUser
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                )}
            >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            <span className="text-xs text-gray-400 mt-1 px-1">
                {format(message.timestamp, 'h:mm a')}
            </span>
        </motion.div>
    );
};
