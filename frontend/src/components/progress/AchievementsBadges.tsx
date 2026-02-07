import React from 'react';
import { Card } from '../common/Card';
import { motion } from 'framer-motion';
import { Lock, Flame, BookOpen, Star, Target, Trophy, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

const BADGES = [
    { id: '1', title: '7-Day Streak', icon: Flame, earned: true, date: '2026-02-01', color: 'from-orange-400 to-red-500' },
    { id: '2', title: 'First Journal', icon: BookOpen, earned: true, date: '2026-01-15', color: 'from-blue-400 to-indigo-500' },
    { id: '3', title: 'Mindful Master', icon: Star, earned: true, date: '2026-01-20', color: 'from-yellow-400 to-orange-500' },
    { id: '4', title: 'Goal Setter', icon: Target, earned: false, color: 'from-green-400 to-teal-500' },
    { id: '5', title: '30-Day Streak', icon: Trophy, earned: false, color: 'from-purple-400 to-pink-500' },
    { id: '6', title: 'Early Bird', icon: Zap, earned: false, color: 'from-cyan-400 to-blue-500' },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
};

export const AchievementsBadges: React.FC = () => {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Achievements</h3>
                <span className="text-sm text-gray-500">
                    {BADGES.filter(b => b.earned).length}/{BADGES.length} earned
                </span>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
            >
                {BADGES.map(badge => (
                    <motion.div
                        key={badge.id}
                        variants={item}
                        className={cn(
                            "relative flex flex-col items-center p-4 rounded-2xl text-center transition-all",
                            badge.earned ? "bg-white border border-gray-100 shadow-sm hover:shadow-md" : "bg-gray-50"
                        )}
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-3",
                            badge.earned
                                ? `bg-gradient-to-br ${badge.color} shadow-lg`
                                : "bg-gray-200"
                        )}>
                            {badge.earned ? (
                                <badge.icon className="h-7 w-7 text-white" />
                            ) : (
                                <Lock className="h-6 w-6 text-gray-400" />
                            )}
                        </div>
                        <p className={cn(
                            "text-sm font-medium",
                            badge.earned ? "text-gray-900" : "text-gray-400"
                        )}>
                            {badge.title}
                        </p>
                        {badge.earned && badge.date && (
                            <p className="text-xs text-gray-400 mt-1">{badge.date}</p>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </Card>
    );
};
