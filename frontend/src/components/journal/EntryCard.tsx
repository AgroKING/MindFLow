import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Entry {
    id: string;
    title: string;
    preview: string;
    date: Date;
    mood: string;
    tags: string[];
}

interface EntryCardProps {
    entry: Entry;
    viewMode: 'grid' | 'list';
    onClick: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, viewMode, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                onClick={onClick}
                className={cn(
                    "p-5 cursor-pointer group transition-all hover:shadow-lg border-transparent hover:border-blue-100",
                    viewMode === 'list' && "flex items-center gap-6"
                )}
            >
                <div className={cn("flex-1", viewMode === 'list' && "flex items-center gap-6")}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{entry.mood}</span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {format(entry.date, 'MMM d, yyyy')}
                        </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {entry.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {entry.preview}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                        {entry.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                        Read <ArrowRight className="h-4 w-4" />
                    </span>
                </div>
            </Card>
        </motion.div>
    );
};
