import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Wind, Sparkles, HelpCircle } from 'lucide-react';

interface SuggestedRepliesProps {
    onSelect: (reply: string) => void;
}

const SUGGESTIONS = [
    { text: 'I need help', icon: HelpCircle, color: 'text-red-500' },
    { text: 'Breathing exercise', icon: Wind, color: 'text-blue-500' },
    { text: 'Motivational quote', icon: Sparkles, color: 'text-yellow-500' },
    { text: 'How am I doing?', icon: Heart, color: 'text-pink-500' },
];

export const SuggestedReplies: React.FC<SuggestedRepliesProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-wrap gap-2 px-4 py-3">
            {SUGGESTIONS.map((suggestion, i) => (
                <motion.button
                    key={suggestion.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onSelect(suggestion.text)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                    <suggestion.icon className={`h-4 w-4 ${suggestion.color}`} />
                    {suggestion.text}
                </motion.button>
            ))}
        </div>
    );
};
