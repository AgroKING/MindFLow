import React, { useEffect } from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { useMoodStore } from '../../store/useMoodStore'; // Import store

const getMoodColor = (value: number) => {
    switch (value) {
        case 0: return 'bg-gray-100';
        case 1: return 'bg-red-300';
        case 2: return 'bg-orange-300';
        case 3: return 'bg-yellow-200';
        case 4: return 'bg-blue-300';
        case 5: return 'bg-green-400';
        default: return 'bg-gray-100';
    }
};

export const MoodHeatmap: React.FC = () => {
    // Generate dates for the last 3 months ~ 12 weeks for better layout
    const today = new Date();
    const startDate = subDays(today, 89); // approx 3 months
    const dates = eachDayOfInterval({ start: startDate, end: today });

    const { moods, fetchMoods } = useMoodStore();

    useEffect(() => {
        // Fetch moods if not already present or explicitly refresh
        fetchMoods();
    }, [fetchMoods]);

    return (
        <Card className="p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Mood History</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gray-100" />
                        <div className="w-3 h-3 rounded-sm bg-red-300" />
                        <div className="w-3 h-3 rounded-sm bg-yellow-200" />
                        <div className="w-3 h-3 rounded-sm bg-green-400" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-2">
                <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
                    {/* Render days */}
                    {dates.map((date) => {
                        // Find mood for this day
                        // If multiple moods, take the average or the last one. Let's take the last one for simplicity or max.
                        // Assuming moods are sorted or we filter.
                        const dayMoods = moods.filter(m => isSameDay(new Date(m.date), date));
                        // Let's take the average score if multiple, or just the first one found. 
                        // Actually let's take the latest one (assuming order or check timestamps). 
                        // For a heatmap, average or max is usually good. Let's do max for "best mood of the day" or average.
                        // Let's go with the last entry's score for now to reflect "end of day" feeling.
                        const dataPoint = dayMoods.length > 0 ? dayMoods[dayMoods.length - 1] : null;
                        const value = dataPoint ? dataPoint.score : 0;

                        return (
                            <div
                                key={date.toISOString()}
                                className={cn(
                                    "w-3 h-3 md:w-4 md:h-4 rounded-[3px] transition-colors hover:ring-1 hover:ring-gray-400 cursor-pointer",
                                    getMoodColor(value)
                                )}
                                title={`${format(date, 'MMM d')}: ${value ? ['Terrible', 'Bad', 'Okay', 'Good', 'Great'][value - 1] : 'No Entry'}`}
                            />
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};
