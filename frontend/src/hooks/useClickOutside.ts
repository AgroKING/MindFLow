import { useEffect, useRef } from 'react';

/**
 * Hook to detect clicks outside a specific element
 * @param handler - Callback function to execute when clicking outside
 * @param enabled - Whether the hook is active
 */
export const useClickOutside = (
    handler: () => void,
    enabled: boolean = true
) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        // Add small delay to prevent immediate closing
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handler, enabled]);

    return ref;
};
