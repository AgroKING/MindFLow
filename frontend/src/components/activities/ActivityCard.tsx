import React, { useState } from 'react';
import { Card } from '../common/Card';
import { motion } from 'framer-motion';
import { Clock, Heart, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Activity {
    id: string;
    title: string;
    category: string;
    duration: number;
    difficulty: 1 | 2 | 3;
    image: string;
    description: string;
}

interface ActivityCardProps {
    activity: Activity;
    onClick: () => void;
}

const GRADIENTS = [
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-teal-500',
    'from-orange-400 to-red-500',
    'from-cyan-400 to-blue-500',
];

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const gradient = GRADIENTS[parseInt(activity.id) % GRADIENTS.length];

    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className="cursor-pointer group"
        >
            <Card className="p-0 overflow-hidden border-0 shadow-lg">
                {/* Image/Gradient Header */}
                <div className={cn(
                    "relative h-40 bg-gradient-to-br",
                    gradient
                )}>
                    {/* Overlay Content */}
                    <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-4">
                        {/* Top Row */}
                        <div className="flex justify-between items-start">
                            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.duration} min
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFavorite(!isFavorite);
                                }}
                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                            >
                                <Heart
                                    className={cn(
                                        "h-4 w-4 transition-all",
                                        isFavorite ? "fill-red-500 text-red-500" : "text-white"
                                    )}
                                />
                            </button>
                        </div>

                        {/* Bottom Content */}
                        <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-sm">
                                {activity.title}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3].map(level => (
                                    <span
                                        key={level}
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            level <= activity.difficulty ? "bg-white" : "bg-white/30"
                                        )}
                                    />
                                ))}
                                <span className="text-white/80 text-xs ml-1">
                                    {activity.difficulty === 1 ? 'Beginner' : activity.difficulty === 2 ? 'Intermediate' : 'Advanced'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                    <button className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4" fill="currentColor" />
                        Start Activity
                    </button>
                </div>
            </Card>
        </motion.div>
    );
};
