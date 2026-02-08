import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = 'rectangular',
    width,
    height,
    animation = true,
}) => {
    const baseClasses = cn(
        "bg-gray-200 overflow-hidden",
        variant === 'circular' && "rounded-full",
        variant === 'text' && "rounded h-4",
        variant === 'rectangular' && "rounded-xl",
        className
    );

    const style = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    return (
        <div className={baseClasses} style={style}>
            {animation && (
                <motion.div
                    animate={{ x: ['0%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
            )}
        </div>
    );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={cn("bg-white rounded-2xl p-6 border border-gray-100", className)}>
        <Skeleton variant="text" width="60%" height={24} className="mb-4" />
        <Skeleton variant="text" width="80%" className="mb-2" />
        <Skeleton variant="text" width="40%" />
    </div>
);

// Metric Card Skeleton
export const MetricCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
        </div>
        <Skeleton variant="text" width="50%" height={32} className="mb-2" />
        <Skeleton variant="text" width="70%" height={16} />
    </div>
);

// Page Skeleton
export const PageSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div>
            <Skeleton variant="text" width="40%" height={32} className="mb-2" />
            <Skeleton variant="text" width="60%" height={16} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <MetricCardSkeleton key={i} />)}
        </div>
        <CardSkeleton />
        <div className="grid md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
        </div>
    </div>
);
