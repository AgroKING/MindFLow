import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2E5266',
            bodyColor: '#2E5266',
            borderColor: 'rgba(46, 82, 102, 0.1)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 4,
            usePointStyle: true,
            displayColors: false,
            callbacks: {
                label: function (context: any) {
                    const moods = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];
                    return moods[context.raw - 1];
                }
            },
            titleFont: { family: "'Manrope', sans-serif", size: 13, weight: 'bold' as const },
            bodyFont: { family: "'Manrope', sans-serif", size: 12 },
        },
    },
    scales: {
        y: {
            display: false,
            min: 1,
            max: 5.5, // slightly higher to prevent cutting off top point
        },
        x: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    family: "'JetBrains Mono', monospace",
                    size: 11
                },
                color: '#8E8E93',
                padding: 10
            },
            border: { display: false }
        },
    },
    elements: {
        line: {
            tension: 0.4,
        },
        point: {
            radius: 0,
            hoverRadius: 6,
            hoverBackgroundColor: '#7FA99B',
            hoverBorderColor: '#FFFFFF',
            hoverBorderWidth: 2,
        }
    },
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
};

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const InsightsChart: React.FC = () => {
    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Mood',
                data: [3, 4, 3, 5, 4, 3, 4],
                borderColor: '#7FA99B',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(127, 169, 155, 0.4)');
                    gradient.addColorStop(1, 'rgba(127, 169, 155, 0)');
                    return gradient;
                },
                borderWidth: 3,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#7FA99B',
                pointBorderWidth: 2,
            },
        ],
    };

    return (
        <div className="bg-white rounded-[24px] p-8 shadow-[var(--shadow-md)] border border-[#2E5266]/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl font-semibold text-[#2E5266]">Weekly Insights</h3>
                <div className="bg-[#7FA99B]/10 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-[#7FA99B]" />
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px] -ml-2">
                <Line options={options} data={data} />
            </div>

            <div className="mt-6 pt-6 border-t border-[#f0f0f0]">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-[#2E5266]/60 font-medium mb-1">Average Mood</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#2E5266]">Good</span>
                            <span className="text-xs text-[#7FA99B] font-medium bg-[#7FA99B]/10 px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-[#2E5266]/60 font-medium mb-1">Check-ins</p>
                        <span className="text-2xl font-mono font-bold text-[#2E5266]">14</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
