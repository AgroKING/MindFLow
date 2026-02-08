import React, { useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useTheme } from '../../context/ThemeContext';

// Sound mappings
const THEME_SOUNDS: Record<string, string> = {
    'default': '/sounds/click-modern.mp3',
    'star-wars': '/sounds/lightsaber-on.mp3',
    'breaking-bad': '/sounds/science-bloop.mp3',
    'barbie': '/sounds/pop-sparkle.mp3',
};

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
                secondary: "bg-secondary text-secondary-foreground hover:opacity-90 shadow-sm",
                outline: "border border-input hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                destructive: "bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm",
                glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
                neobrutalist: "border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none rounded-none",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 px-4 rounded-lg",
                lg: "h-14 px-8 rounded-2xl text-lg",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, children, onClick, ...props }, ref) => {
        const { theme } = useTheme();
        // Use the updated hook signature which returns [play, { stop }]
        const [delayedPlay] = useSound(THEME_SOUNDS[theme] || THEME_SOUNDS['default'], { volume: 0.4 });

        // Immediate click sound for better perceived performance
        const playClick = () => {
            const audio = new Audio(THEME_SOUNDS[theme] || THEME_SOUNDS['default']);
            audio.volume = 0.4;
            audio.play().catch(() => { });
        };

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            playClick(); // Use immediate play

            // Theme specific haptics
            if (theme === 'breaking-bad') {
                if (navigator.vibrate) navigator.vibrate([50]);
            } else if (theme === 'star-wars') {
                if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
            } else if (theme === 'barbie') {
                if (navigator.vibrate) navigator.vibrate([10, 10, 10]);
            } else {
                if (navigator.vibrate) navigator.vibrate(10);
            }

            onClick?.(e);
        };

        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                onClick={handleClick}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
