import React from 'react';
import { Card } from '../common/Card';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Line Chart Data
const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Average Mood',
            data: [3, 2, 4, 4, 3, 5, 4],
            fill: true,
            borderColor: '#007AFF',
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            tension: 0.4,
        },
        {
            label: 'Anxiety Level',
            data: [2, 4, 1, 1, 3, 1, 2],
            borderColor: '#FF3B30', // Red
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.4,
        }
    ],
};

const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: { usePointStyle: true, boxWidth: 6 }
        },
    },
    scales: {
        y: { beginAtZero: true, max: 10 },
        x: { grid: { display: false } }
    }
};

// Pie Chart Data
const pieData = {
    labels: ['Happy', 'Anxious', 'Calm', 'Stressed', 'Tired'],
    datasets: [
        {
            data: [35, 20, 25, 10, 10],
            backgroundColor: [
                'rgba(52, 199, 89, 0.6)',  // Green
                'rgba(255, 59, 48, 0.6)',  // Red
                'rgba(0, 122, 255, 0.6)',  // Blue
                'rgba(255, 149, 0, 0.6)',  // Orange
                'rgba(142, 142, 147, 0.6)', // Gray
            ],
            borderColor: [
                'rgba(52, 199, 89, 1)',
                'rgba(255, 59, 48, 1)',
                'rgba(0, 122, 255, 1)',
                'rgba(255, 149, 0, 1)',
                'rgba(142, 142, 147, 1)',
            ],
            borderWidth: 1,
        },
    ],
};

const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'right' as const },
    },
};

export const MoodCharts: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 h-[350px]">
                <h3 className="text-lg font-semibold mb-4">Mood Trends</h3>
                <div className="h-[280px]">
                    <Line options={lineOptions} data={lineData} />
                </div>
            </Card>

            <Card className="p-6 h-[350px]">
                <h3 className="text-lg font-semibold mb-4">Emotion Distribution</h3>
                <div className="h-[280px] flex justify-center">
                    <Pie options={pieOptions} data={pieData} />
                </div>
            </Card>
        </div>
    );
};
