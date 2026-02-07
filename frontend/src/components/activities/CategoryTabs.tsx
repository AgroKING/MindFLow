import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Wind, Heart, BookOpen, Activity, Moon } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: Activity },
    { id: 'meditation', label: 'Meditation', icon: Heart },
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'journaling', label: 'Journaling', icon: BookOpen },
    { id: 'sleep', label: 'Sleep', icon: Moon },
];

interface CategoryTabsProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onCategoryChange }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(category => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        activeCategory === category.id
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    )}
                >
                    <category.icon className="h-4 w-4" />
                    {category.label}
                    {activeCategory === category.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-blue-600 rounded-full -z-10"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};
