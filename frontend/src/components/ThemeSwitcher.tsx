import React from 'react';
import { useTheme, type Theme } from '../context/ThemeContext';
import { Button } from './common/Button';
import { Volume2, VolumeX, Smartphone, Sparkles, FlaskConical, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme, soundEnabled, setSoundEnabled, hapticsEnabled, setHapticsEnabled } = useTheme();

    const themes: { id: Theme; label: string; icon: React.ReactNode; color: string }[] = [
        { id: 'the-web-slinger', label: 'The Web-Slinger', icon: <Zap className="w-4 h-4" />, color: 'bg-gradient-to-r from-[#E23636] to-[#013875]' },
        { id: 'the-empire', label: 'The Empire', icon: <FlaskConical className="w-4 h-4" />, color: 'bg-gradient-to-r from-[#406838] to-[#3F8CA8]' },
        { id: 'enchanted-tales', label: 'Enchanted Tales', icon: <Sparkles className="w-4 h-4" />, color: 'bg-gradient-to-r from-[#E0218A] to-[#00D4D4]' },
    ];

    return (
        <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg shadow-sm">
            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">Theme</h3>
                <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => (
                        <Button
                            key={t.id}
                            variant={theme === t.id ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "justify-start gap-2",
                                theme === t.id ? "" : "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <span className={cn("w-3 h-3 rounded-full border border-current", t.color)} />
                            {t.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">Sensory</h3>
                <div className="flex gap-2">
                    <Button
                        variant={soundEnabled ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="flex-1 gap-2"
                        title="Toggle Sound"
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        Sound
                    </Button>
                    <Button
                        variant={hapticsEnabled ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setHapticsEnabled(!hapticsEnabled)}
                        className="flex-1 gap-2"
                        title="Toggle Haptics"
                    >
                        {hapticsEnabled ? <Smartphone className="w-4 h-4" /> : <Smartphone className="w-4 h-4 opacity-50" />}
                        Haptics
                    </Button>
                </div>
            </div>
        </div>
    );
};
