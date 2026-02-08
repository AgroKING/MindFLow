import React from 'react';
import { MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '../common/Button';
import { motion } from 'framer-motion';

export const ChatHeader: React.FC = () => {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-4">
                {/* Animated AI Avatar */}
                <motion.div
                    animate={{
                        background: [
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        ],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                >
                    M
                </motion.div>

                <div>
                    <h2 className="font-semibold text-gray-900">MindFlow Coach</h2>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-500">Online</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500">
                    <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500">
                    <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
