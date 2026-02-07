import React from 'react';
import { MoodInput } from '../components/mood/MoodInput';
import { MoodHeatmap } from '../components/mood/MoodHeatmap';
import { MoodCharts } from '../components/mood/MoodCharts';
import { InsightsPanel } from '../components/mood/InsightsPanel';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const MoodTracker: React.FC = () => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            <motion.div variants={item}>
                <MoodInput />
            </motion.div>

            <motion.div variants={item}>
                <MoodHeatmap />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={item} className="lg:col-span-2">
                    <MoodCharts />
                </motion.div>
                <motion.div variants={item}>
                    <InsightsPanel />
                </motion.div>
            </div>
        </motion.div>
    );
};
