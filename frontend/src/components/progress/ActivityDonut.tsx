import React from 'react';
import { Card } from '../common/Card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORIES = [
    { name: 'Meditation', value: 35, color: '#6366f1' },
    { name: 'Breathing', value: 25, color: '#8b5cf6' },
    { name: 'Journaling', value: 20, color: '#ec4899' },
    { name: 'Movement', value: 12, color: '#f97316' },
    { name: 'Sleep', value: 8, color: '#14b8a6' },
];

export const ActivityDonut: React.FC = () => {
    const data = {
        labels: CATEGORIES.map(c => c.name),
        datasets: [
            {
                data: CATEGORIES.map(c => c.value),
                backgroundColor: CATEGORIES.map(c => c.color),
                borderWidth: 0,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
            },
        },
    };

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">Activity Breakdown</h3>
            <div className="flex gap-6">
                <div className="relative w-48 h-48">
                    <Doughnut data={data} options={options} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-3xl font-bold">100</p>
                            <p className="text-sm text-gray-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-3">
                    {CATEGORIES.map(cat => (
                        <div key={cat.name} className="flex items-center gap-3">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            <span className="flex-1 text-sm text-gray-600">{cat.name}</span>
                            <span className="text-sm font-medium">{cat.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};
