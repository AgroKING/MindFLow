import React, { useState } from 'react';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';
import { useMoodStore } from '../../store/useMoodStore';
import { toast } from 'sonner';

// Watercolor-inspired colors
const MOODS = [
    { emoji: '☁️', label: 'Heavy', color: '#819FA0', score: 1, gradient: 'from-[#819FA0] to-[#597475]' },
    { emoji: '🌧️', label: 'Low', color: '#94A89A', score: 2, gradient: 'from-[#94A89A] to-[#738779]' },
    { emoji: '🍂', label: 'Neutral', color: '#D4A574', score: 3, gradient: 'from-[#D4A574] to-[#B88A58]' },
    { emoji: '🌿', label: 'Calm', color: '#7FA99B', score: 4, gradient: 'from-[#7FA99B] to-[#608579]' },
    { emoji: '☀️', label: 'Radiant', color: '#E07A5F', score: 5, gradient: 'from-[#E07A5F] to-[#C46348]' },
];

export const MoodCheckIn: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const [note, setNote] = useState('');
    const { addMood, isLoading } = useMoodStore();

    const handleMoodSelect = (index: number) => {
        setSelectedMood(index);
        if (!isNoteExpanded) setIsNoteExpanded(true);
    };

    const handleSave = async () => {
        if (selectedMood === null) return;

        const moodData = MOODS[selectedMood];
        try {
            await addMood({
                score: moodData.score,
                note: note,
                activities: []
            });
            toast.success('Reflection saved gently.');
            setSelectedMood(null);
            setNote('');
            setIsNoteExpanded(false);
        } catch (error) {
            console.error(error);
            toast.error('Could not save your reflection');
        }
    };

    return (
        <div className="card-organic p-8 relative overflow-hidden">
            <div className="relative z-10">
                <div className="mb-8">
                    <h2 className="font-serif text-2xl font-medium text-[#2C2C2C] flex items-center gap-2">
                        How does your heart feel?
                        <span className="inline-block w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse" />
                    </h2>
                    <p className="text-[#595959] font-sans mt-1">Select the shape of your emotion.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {MOODS.map((mood, index) => (
                        <button
                            key={mood.label}
                            onClick={() => handleMoodSelect(index)}
                            className={cn(
                                "group relative w-20 h-20 md:w-24 md:h-24 rounded-blob transition-all duration-500 flex flex-col items-center justify-center gap-1",
                                selectedMood === index
                                    ? "scale-110 shadow-lg ring-4 ring-[#E6DCCD] ring-offset-2"
                                    : "hover:scale-105 hover:shadow-md opacity-80 hover:opacity-100"
                            )}
                            style={{
                                background: `linear-gradient(135deg, ${mood.color}, white)`,
                                borderRadius: [
                                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                                    '30% 60% 70% 40% / 50% 60% 30% 60%',
                                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                                    '40% 60% 70% 30% / 40% 50% 60% 50%',
                                    '50% 50% 50% 50% / 50% 50% 50% 50%' // Circle for Radiant
                                ][index]
                            }}
                        >
                            <span className="text-2xl filter drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                                {mood.emoji}
                            </span>
                            <span className={cn(
                                "text-xs font-bold text-white uppercase tracking-wider opacity-0 transition-opacity duration-300 transform translate-y-2",
                                (selectedMood === index || "group-hover:opacity-100 group-hover:translate-y-0")
                            )}>
                                {mood.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Note Section - Paper Style */}
                <div className={cn(
                    "overflow-hidden transition-all duration-700 ease-in-out mt-6",
                    isNoteExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E6DCCD] shadow-inner relative">
                        {/* Ruled Lines */}
                        <div className="absolute inset-0 pointer-events-none opacity-10"
                            style={{ backgroundImage: 'linear-gradient(#2C2C2C 1px, transparent 1px)', backgroundSize: '100% 2em' }}
                        />

                        <label className="block font-hand text-xl text-[#94A89A] mb-2 -rotate-1">
                            Care to elaborate?
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-32 bg-transparent border-none p-0 text-[#2C2C2C] text-lg leading-[2em] placeholder:text-[#2C2C2C]/20 focus:ring-0 resize-none font-serif"
                            placeholder="I'm feeling this way because..."
                        />
                        <div className="flex justify-end mt-4 gap-3 relative z-10">
                            <Button
                                variant="ghost"
                                onClick={() => setIsNoteExpanded(false)}
                                className="text-[#595959] hover:text-[#2C2C2C] font-sans"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={isLoading}
                                className="btn-organic bg-[#E07A5F] hover:bg-[#D48C70] text-white px-6 shadow-[2px_4px_10px_rgba(224,122,95,0.3)]"
                            >
                                Save Entry
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        </div>
    );
};
