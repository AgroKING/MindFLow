import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { cn } from '../../lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const PERIODS = ['Week', 'Month', 'Year'] as const;

const DATA_BY_PERIOD = {
    Week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [3.5, 4.0, 3.8, 4.2, 4.5, 4.3, 4.8],
    },
    Month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [3.8, 4.0, 4.2, 4.5],
    },
    Year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [3.2, 3.5, 3.8, 4.0, 3.9, 4.2, 4.3, 4.5, 4.4, 4.6, 4.5, 4.8],
    },
};

export const MoodTimeline: React.FC = () => {
    const [period, setPeriod] = useState<typeof PERIODS[number]>('Week');
    const currentData = DATA_BY_PERIOD[period];

    const data = {
        labels: currentData.labels,
        datasets: [
            {
                fill: true,
                label: 'Mood Score',
                data: currentData.data,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                    return gradient;
                },
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(99, 102, 241)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
            },
        },
        scales: {
            y: {
                min: 1,
                max: 5,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { stepSize: 1 },
            },
            x: {
                grid: { display: false },
            },
        },
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Mood Timeline</h3>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                                period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-64">
                <Line data={data} options={options} />
            </div>
        </Card>
    );
};
