import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center gap-1 bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md w-fit">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                    }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                />
            ))}
        </div>
    );
};
