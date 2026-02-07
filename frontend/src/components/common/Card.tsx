import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'neo';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const variants = {
            default: "bg-white border border-neutral/10 shadow-md",
            glass: "bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg",
            gradient: "bg-card-grad border border-white/20 shadow-md"
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-[16px] p-6 transition-all duration-300",
                    variants[variant as keyof typeof variants] || variants.default,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = "Card";
