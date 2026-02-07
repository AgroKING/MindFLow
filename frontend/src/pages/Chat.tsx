import React, { useState, useRef, useEffect } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ChatInput } from '../components/chat/ChatInput';
import { SuggestedReplies } from '../components/chat/SuggestedReplies';
import { CrisisAlert } from '../components/chat/CrisisAlert';
import { AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it all', 'don\'t want to live', 'self harm'];

const AI_RESPONSES = [
    "I hear you. It's completely normal to feel this way sometimes. Would you like to try a quick breathing exercise together?",
    "Thank you for sharing that with me. Your feelings are valid. Let's explore what might be contributing to these emotions.",
    "I'm here for you. Remember, it's okay to take things one step at a time. What's one small thing you could do right now to feel a bit better?",
    "That sounds challenging. Based on your recent journal entries, I've noticed you often feel better after spending time outdoors. Have you considered a short walk?",
    "I understand. Sometimes just acknowledging our feelings is the first step. Would you like to talk more about what's on your mind?",
];

export const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Hi there! 👋 I'm your MindFlow Coach. I'm here to support your mental wellness journey. How are you feeling today?",
            sender: 'ai',
            timestamp: new Date(Date.now() - 60000),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [showCrisisAlert, setShowCrisisAlert] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const checkForCrisis = (text: string): boolean => {
        const lowerText = text.toLowerCase();
        return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
    };

    const handleSendMessage = (content: string) => {
        // Check for crisis keywords
        if (checkForCrisis(content)) {
            setShowCrisisAlert(true);
        }

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setShowSuggestions(false);

        // Simulate AI typing and response
        setIsTyping(true);
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
            setShowSuggestions(true);
        }, 1500 + Math.random() * 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <ChatHeader />

            {/* Crisis Alert */}
            <AnimatePresence>
                {showCrisisAlert && (
                    <div className="pt-4">
                        <CrisisAlert onDismiss={() => setShowCrisisAlert(false)} />
                    </div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.map(message => (
                    <MessageBubble key={message.id} message={message} />
                ))}

                {isTyping && (
                    <div className="self-start">
                        <TypingIndicator />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Replies */}
            <AnimatePresence>
                {showSuggestions && !isTyping && (
                    <SuggestedReplies onSelect={handleSendMessage} />
                )}
            </AnimatePresence>

            {/* Input */}
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
    );
};
