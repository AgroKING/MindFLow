import React from 'react';
import { Card } from '../common/Card';
import { Sparkles, Trophy, Calendar, Zap } from 'lucide-react';

const INSIGHTS = [
    {
        icon: Trophy,
        label: "Happiest Day",
        value: "Saturday",
        desc: "Avg Mood: 4.8",
        color: "bg-yellow-100 text-yellow-600"
    },
    {
        icon: Calendar,
        label: "Longest Streak",
        value: "12 Days",
        desc: "Current: 5 Days",
        color: "bg-blue-100 text-blue-600"
    },
    {
        icon: Zap,
        label: "Common Trigger",
        value: "Work Deadline",
        desc: "Correlates with Stress",
        color: "bg-orange-100 text-orange-600"
    }
];

export const InsightsPanel: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INSIGHTS.map((item, i) => (
                    <Card key={i} className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-full ${item.color}`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                            <p className="text-lg font-bold text-gray-900">{item.value}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* AI Recommendation */}
            <Card variant="glass" className="p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                <div className="relative z-10 flex gap-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md h-fit">
                        <Sparkles className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">AI Recommendation</h3>
                        <p className="text-indigo-100 leading-relaxed max-w-2xl">
                            "It looks like your anxiety peaks every Tuesday afternoon. Consider scheduling a 10-minute meditation break at 2:00 PM to reset your focus. I've found a guided session that might help."
                        </p>
                        <button className="mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/10">
                            Start Session
                        </button>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            </Card>
        </div>
    );
};
