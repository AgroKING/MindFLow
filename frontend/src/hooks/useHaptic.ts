import { useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

type HapticPattern = number | number[];

export const useHaptic = () => {
    const { hapticsEnabled } = useTheme();

    const trigger = useCallback((pattern: HapticPattern = 10) => {
        if (hapticsEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }, [hapticsEnabled]);

    return trigger;
};
