import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Generate 365 days of mock data
const generateHeatmapData = () => {
    const today = new Date();
    const startDate = subDays(today, 364);
    const days = eachDayOfInterval({ start: startDate, end: today });

    return days.map(date => ({
        date,
        value: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0,
    }));
};

const HEATMAP_DATA = generateHeatmapData();

const getColor = (value: number): string => {
    if (value === 0) return 'bg-gray-100';
    if (value === 1) return 'bg-blue-100';
    if (value === 2) return 'bg-blue-200';
    if (value === 3) return 'bg-blue-400';
    if (value === 4) return 'bg-blue-600';
    return 'bg-blue-800';
};

export const EngagementHeatmap: React.FC = () => {
    // Group by week (7 days per column)
    const weeks: typeof HEATMAP_DATA[] = [];
    for (let i = 0; i < HEATMAP_DATA.length; i += 7) {
        weeks.push(HEATMAP_DATA.slice(i, i + 7));
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Engagement Calendar</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(level => (
                            <span key={level} className={cn("w-3 h-3 rounded-sm", getColor(level))} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={cn(
                                        "w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125",
                                        getColor(day.value)
                                    )}
                                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.value} activities`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between mt-4 text-xs text-gray-400">
                <span>{format(subDays(new Date(), 364), 'MMM yyyy')}</span>
                <span>{format(new Date(), 'MMM yyyy')}</span>
            </div>
        </Card>
    );
};
