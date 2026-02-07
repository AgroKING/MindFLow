import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useMoodStore } from '../../store/useMoodStore';
import { Sun, Moon } from 'lucide-react';

export const WelcomeBanner: React.FC = () => {
    const [greeting, setGreeting] = useState('');
    const [dateString, setDateString] = useState('');
    const { user } = useAuthStore();
    const { moods } = useMoodStore();

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        // Hand-written date format
        setDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    }, []);

    // Get latest mood for context
    const latestMood = moods[0];

    const getTimeIcon = () => {
        const hour = new Date().getHours();
        if (hour < 6) return <Moon className="h-8 w-8 text-[#E07A5F]" />;
        if (hour < 18) return <Sun className="h-10 w-10 text-[#E07A5F] animate-[spin_12s_linear_infinite]" />;
        return <Moon className="h-8 w-8 text-[#E07A5F]" />;
    };

    return (
        <div className="relative overflow-hidden bg-white/40 backdrop-blur-sm border border-[#E6DCCD] rounded-[32px] p-8 md:p-12 shadow-sm transition-all duration-700 hover:shadow-md group">

            {/* Organic Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E07A5F]/5 rounded-blob mix-blend-multiply filter blur-3xl opacity-70 animate-breathe" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#94A89A]/10 rounded-blob mix-blend-multiply filter blur-3xl opacity-70 animate-breathe animation-delay-2000" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {getTimeIcon()}
                        <span className="font-hand text-2xl text-[#94A89A] -rotate-1 mt-2">{dateString}</span>
                    </div>

                    <h1 className="font-serif text-4xl md:text-5xl text-[#2C2C2C] leading-tight opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                        {greeting}, <span className="text-[#E07A5F] italic">{user?.name || 'Friend'}</span>.
                    </h1>

                    <p className="mt-4 text-lg text-[#595959] max-w-xl opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200 leading-relaxed font-sans">
                        {latestMood
                            ? "I noticed you're feeling a bit " + (latestMood.score > 3 ? "bright" : "heavy") + " today. Should we reflect on that together?"
                            : "Take a deep breath. This is your space to just be."}
                    </p>
                </div>

            </div>

            {/* Daily Wisdom / Quote - Sticker Style */}
            <div className="hidden md:block rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E6DCCD] shadow-[4px_4px_0px_#E6DCCD] max-w-xs transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#E6DCCD] transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#E07A5F]/10 flex items-center justify-center mb-3 text-[#E07A5F]">
                        ❝
                    </div>
                    <p className="font-serif italic text-lg text-[#2C2C2C] mb-3 leading-relaxed">
                        "Almost everything will work again if you unplug it for a few minutes, including you."
                    </p>
                    <p className="text-sm font-sans font-bold text-[#94A89A] uppercase tracking-wider">
                        — Anne Lamott
                    </p>
                </div>
            </div>
        </div>
    );
};
