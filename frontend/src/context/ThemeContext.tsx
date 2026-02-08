import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'the-web-slinger' | 'the-empire' | 'enchanted-tales';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    hapticsEnabled: boolean;
    setHapticsEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as Theme) || 'the-web-slinger';
    });

    const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
        const saved = localStorage.getItem('soundEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() => {
        const saved = localStorage.getItem('hapticsEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('hapticsEnabled', JSON.stringify(hapticsEnabled));
    }, [hapticsEnabled]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const setSoundEnabled = (enabled: boolean) => {
        setSoundEnabledState(enabled);
    };

    const setHapticsEnabled = (enabled: boolean) => {
        setHapticsEnabledState(enabled);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                soundEnabled,
                setSoundEnabled,
                hapticsEnabled,
                setHapticsEnabled,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
