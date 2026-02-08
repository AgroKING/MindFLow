import { useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { soundManager } from '../lib/soundManager';

export const useSound = (soundPath: string, options?: { volume?: number; playbackRate?: number }) => {
    const { soundEnabled } = useTheme();

    const play = useCallback(() => {
        if (!soundEnabled) return () => { };

        // Extract sound name from path (e.g., '/sounds/click.mp3' => 'click')
        const soundName = soundPath.split('/').pop()?.replace(/\.\w+$/, '') || soundPath;

        soundManager.play(soundName, options?.volume || 0.5).catch(() => { });

        return () => { }; // stop function (not implemented for now)
    }, [soundPath, soundEnabled, options?.volume]);

    return [play, { stop: () => { } }] as const;
};
