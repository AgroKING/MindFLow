import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Save, Loader2 } from 'lucide-react';
import { useMoodStore } from '../../store/useMoodStore';
import { toast } from 'sonner';

const MOODS = [
    { emoji: '😭', label: 'Terrible', value: 1, color: 'bg-red-100 text-red-600 border-red-200' },
    { emoji: '😢', label: 'Bad', value: 2, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { emoji: '😐', label: 'Okay', value: 3, color: 'bg-gray-100 text-gray-600 border-gray-200' },
    { emoji: '🙂', label: 'Good', value: 4, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { emoji: '🤩', label: 'Great', value: 5, color: 'bg-green-100 text-green-600 border-green-200' },
];

const TAGS = ['Anxious', 'Stressed', 'Calm', 'Happy', 'Productive', 'Tired', 'Energetic', 'Grateful', 'Frustrated'];

export const MoodInput: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [intensity, setIntensity] = useState(5);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [note, setNote] = useState('');

    const { addMood, isLoading } = useMoodStore();

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSave = async () => {
        if (!selectedMood) return;

        try {
            await addMood({
                score: selectedMood,
                intensity,
                tags: selectedTags,
                notes: note,
                date: new Date().toISOString()
            });
            toast.success('Mood logged successfully!');
            // Reset form
            setSelectedMood(null);
            setIntensity(5);
            setSelectedTags([]);
            setNote('');
        } catch (error) {
            console.error('Failed to log mood', error);
            // Error handled by store/interceptor usually, but local handler ok too
        }
    };

    return (
        <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Log Your Mood</h2>
                    <p className="text-gray-500">How are you feeling right now?</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(), 'MMM d, yyyy')}</span>
                    <span className="w-px h-4 bg-gray-300 mx-2" />
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(), 'h:mm a')}</span>
                </div>
            </div>

            {/* Emoji Selector */}
            <div className="flex justify-between md:justify-center gap-2 md:gap-8 mb-10 overflow-x-auto py-2">
                {MOODS.map((mood) => (
                    <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 min-w-[80px]",
                            selectedMood === mood.value
                                ? cn(mood.color, "scale-110 shadow-lg ring-2 ring-offset-2 ring-transparent")
                                : "hover:bg-gray-50 grayscale hover:grayscale-0"
                        )}
                    >
                        <span className="text-4xl md:text-5xl filter drop-shadow-sm transform transition-transform duration-200 hover:scale-125">
                            {mood.emoji}
                        </span>
                        <span className="text-sm font-medium">{mood.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                {/* Left Column: Intensity & Tags */}
                <div className="space-y-8">
                    {/* Intensity Slider */}
                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="font-semibold text-gray-700">Intensity</label>
                            <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">{intensity}/10</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>Mild</span>
                            <span>Intense</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="font-semibold text-gray-700 block mb-3">What's affecting you?</label>
                        <div className="flex flex-wrap gap-2">
                            {TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                        selectedTags.includes(tag)
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                            <button className="px-4 py-1.5 rounded-full text-sm font-medium border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                                + Add Tag
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Note & Save */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="flex-1">
                        <label className="font-semibold text-gray-700 block mb-3">Add a Note</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Describe your thoughts/feelings..."
                            className="w-full h-[180px] p-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-base"
                        />
                    </div>

                    <Button size="lg" className="w-full" disabled={!selectedMood || isLoading} onClick={handleSave}>
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Save Entry
                    </Button>
                </div>
            </div>
        </Card>
    );
};
