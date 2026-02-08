import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const PHILOSOPHICAL_QUOTES = [
    {
        text: "The happiness of your life depends upon the quality of your thoughts.",
        author: "Marcus Aurelius",
        tradition: "Stoicism"
    },
    {
        text: "We suffer more often in imagination than in reality.",
        author: "Seneca",
        tradition: "Stoicism"
    },
    {
        text: "He who has a why to live can bear almost any how.",
        author: "Friedrich Nietzsche",
        tradition: "Existentialism"
    },
    {
        text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
        author: "Albert Camus",
        tradition: "Existentialism"
    },
    {
        text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
        author: "Marcus Aurelius",
        tradition: "Stoicism"
    },
    {
        text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.",
        author: "Jean-Paul Sartre",
        tradition: "Existentialism"
    },
    {
        text: "The obstacle is the way.",
        author: "Marcus Aurelius",
        tradition: "Stoicism"
    },
    {
        text: "In the midst of winter, I found there was, within me, an invincible summer.",
        author: "Albert Camus",
        tradition: "Existentialism"
    },
    {
        text: "Waste no more time arguing what a good man should be. Be one.",
        author: "Marcus Aurelius",
        tradition: "Stoicism"
    },
    {
        text: "It is not that we have a short time to live, but that we waste a lot of it.",
        author: "Seneca",
        tradition: "Stoicism"
    },
    {
        text: "To live is to suffer, to survive is to find some meaning in the suffering.",
        author: "Friedrich Nietzsche",
        tradition: "Existentialism"
    },
    {
        text: "The only thing I know is that I know nothing.",
        author: "Socrates",
        tradition: "Classical"
    },
];

export const QuoteCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Rotate quotes every 8 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % PHILOSOPHICAL_QUOTES.length);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const currentQuote = PHILOSOPHICAL_QUOTES[currentIndex];

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 p-10 border border-primary/20 shadow-sm">
            <div className="absolute top-6 left-6 text-primary/20">
                <Quote className="h-16 w-16" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                >
                    <blockquote className="space-y-6">
                        <p className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed italic">
                            "{currentQuote.text}"
                        </p>
                        <footer className="flex items-center justify-between">
                            <cite className="not-italic">
                                <div className="font-semibold text-lg text-primary">
                                    — {currentQuote.author}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {currentQuote.tradition}
                                </div>
                            </cite>
                            <div className="flex gap-2">
                                {PHILOSOPHICAL_QUOTES.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                                ? 'w-8 bg-primary'
                                                : 'w-2 bg-primary/30 hover:bg-primary/50'
                                            }`}
                                        aria-label={`Go to quote ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </footer>
                    </blockquote>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
