import React from 'react';
import { Card } from '../common/Card';
import { motion } from 'framer-motion';
import { BookOpen, Flame, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const METRICS = [
    {
        label: 'Journal Entries',
        value: 47,
        trend: 12,
        trendUp: true,
        icon: BookOpen,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
    },
    {
        label: 'Current Streak',
        value: 14,
        suffix: ' days',
        icon: Flame,
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
    },
    {
        label: 'Mood Average',
        value: 4.2,
        trend: 0.5,
        trendUp: true,
        icon: TrendingUp,
        color: 'from-green-500 to-teal-500',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
    },
    {
        label: 'Activities Done',
        value: 23,
        trend: 8,
        trendUp: true,
        icon: Activity,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
    },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const MetricCards: React.FC = () => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
            {METRICS.map((metric) => (
                <motion.div key={metric.label} variants={item}>
                    <Card className="p-5 hover:scale-[1.02] transition-transform">
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn("p-3 rounded-xl", metric.bgColor)}>
                                <metric.icon className={cn("h-6 w-6", metric.iconColor)} />
                            </div>
                            {metric.trend !== undefined && (
                                <div className={cn(
                                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                                    metric.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                    {metric.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {metric.trend > 0 ? '+' : ''}{metric.trend}%
                                </div>
                            )}
                        </div>
                        <p className="text-3xl font-bold tracking-tight">
                            {metric.value}{metric.suffix || ''}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
};
