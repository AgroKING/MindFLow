import React, { useState } from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';
import { Sun, Moon, Monitor, Minus, Plus } from 'lucide-react';

const THEMES = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'auto', label: 'Auto', icon: Monitor },
];

const ACCENT_COLORS = [
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'pink', class: 'bg-pink-500' },
    { id: 'green', class: 'bg-green-500' },
    { id: 'orange', class: 'bg-orange-500' },
];

export const AppearanceSection: React.FC = () => {
    const [theme, setTheme] = useState('light');
    const [accentColor, setAccentColor] = useState('blue');
    const [fontSize, setFontSize] = useState(16);

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Appearance</h2>

            {/* Theme Selector */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                <div className="flex gap-3">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                theme === t.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <t.icon className={cn("h-6 w-6", theme === t.id ? "text-blue-600" : "text-gray-400")} />
                            <span className={cn("text-sm font-medium", theme === t.id ? "text-blue-600" : "text-gray-600")}>
                                {t.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Accent Color */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
                <div className="flex gap-3">
                    {ACCENT_COLORS.map(color => (
                        <button
                            key={color.id}
                            onClick={() => setAccentColor(color.id)}
                            className={cn(
                                "w-10 h-10 rounded-full transition-transform",
                                color.class,
                                accentColor === color.id ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="range"
                            min="12"
                            max="24"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                            <span>A-</span>
                            <span className="font-medium text-gray-600">{fontSize}px</span>
                            <span>A+</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </Card>
    );
};
