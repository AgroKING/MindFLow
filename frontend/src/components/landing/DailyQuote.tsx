import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const FALLBACK_QUOTES = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Wellness is not a 'medical fix' but a way of living - a lifestyle sensitive and responsive to all the dimensions of the body, mind, and spirit.", author: "Greg Anderson" },
    { text: "Your mind will answer most questions if you learn to relax and wait for the answer.", author: "William S. Burroughs" },
    { text: "Breath is the bridge which connects life to consciousness, which unites your body to your thoughts.", author: "Thich Nhat Hanh" },
    { text: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati" }
];

export const DailyQuote: React.FC = () => {
    const [quote, setQuote] = useState(FALLBACK_QUOTES[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading or fetch from API in future
        const timer = setTimeout(() => {
            // Pick a random quote based on the day of the year to be consistent for the day
            const today = new Date();
            const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
            const quoteIndex = dayOfYear % FALLBACK_QUOTES.length;
            setQuote(FALLBACK_QUOTES[quoteIndex]);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 py-8"
        >
            <Quote className="h-8 w-8 text-primary/40 mb-4" />

            {loading ? (
                <div className="h-20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-xl md:text-2xl font-serif text-foreground font-medium italic mb-3">
                        "{quote.text}"
                    </p>
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                        — {quote.author}
                    </span>
                </motion.div>
            )}
        </motion.div>
    );
};
