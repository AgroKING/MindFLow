import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient' | 'neo';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const variants = {
            default: "bg-card text-card-foreground border border-border shadow-md hover:shadow-lg",
            glass: "bg-card/60 backdrop-blur-xl border border-border/50 shadow-lg",
            gradient: "bg-gradient-to-br from-card to-muted border border-border shadow-md",
            neo: "bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", // Example distinct style
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-lg p-6 transition-all duration-300",
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
