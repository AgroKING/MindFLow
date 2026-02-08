import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Table, Sparkles } from 'lucide-react';
import { MetricCards } from '../components/progress/MetricCards';
import { MoodTimeline } from '../components/progress/MoodTimeline';
import { ActivityDonut } from '../components/progress/ActivityDonut';
import { EngagementHeatmap } from '../components/progress/EngagementHeatmap';
import { AchievementsBadges } from '../components/progress/AchievementsBadges';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const Progress: React.FC = () => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 pb-10"
        >
            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
                    <p className="text-gray-500 mt-1">Track your mental wellness journey</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                    <Button variant="secondary" size="sm">
                        <Table className="h-4 w-4 mr-2" />
                        CSV
                    </Button>
                </div>
            </motion.div>

            {/* Metric Cards */}
            <motion.div variants={item}>
                <MetricCards />
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
                <MoodTimeline />
                <ActivityDonut />
            </motion.div>

            {/* Heatmap */}
            <motion.div variants={item}>
                <EngagementHeatmap />
            </motion.div>

            {/* AI Insights */}
            <motion.div variants={item}>
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-purple-900 mb-2">AI Insights</h3>
                            <div className="space-y-2 text-purple-800">
                                <p>📈 You've been most active on <strong>Mondays</strong> - great start to the week!</p>
                                <p>✨ Your mood tends to improve by <strong>15%</strong> after journaling sessions.</p>
                                <p>🧘 Breathing exercises have helped reduce your stress levels consistently.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={item}>
                <AchievementsBadges />
            </motion.div>
        </motion.div>
    );
};
