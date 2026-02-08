import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BreathingExerciseProps {
    onComplete: () => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [progress, setProgress] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const totalCycles = 4;
    const [currentCycle, setCurrentCycle] = useState(0);

    useEffect(() => {
        if (!isActive) return;

        const phaseDurations = { inhale: 4000, hold: 4000, exhale: 4000 };
        const timer = setTimeout(() => {
            if (phase === 'inhale') {
                setPhase('hold');
            } else if (phase === 'hold') {
                setPhase('exhale');
            } else {
                if (currentCycle + 1 >= totalCycles) {
                    setIsActive(false);
                    onComplete();
                } else {
                    setCurrentCycle(c => c + 1);
                    setPhase('inhale');
                }
            }
        }, phaseDurations[phase]);

        return () => clearTimeout(timer);
    }, [phase, isActive, currentCycle, onComplete]);

    useEffect(() => {
        if (isActive) {
            setProgress(((currentCycle + 1) / totalCycles) * 100);
        }
    }, [currentCycle, isActive]);

    const circleVariants = {
        inhale: { scale: 1.5, transition: { duration: 4 } },
        hold: { scale: 1.5, transition: { duration: 4 } },
        exhale: { scale: 1, transition: { duration: 4 } },
    };

    return (
        <div className="flex flex-col items-center gap-8 py-8">
            {/* Breathing Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                <motion.div
                    animate={isActive ? phase : 'exhale'}
                    variants={circleVariants}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-200"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white drop-shadow-lg capitalize">
                        {isActive ? phase : 'Ready'}
                    </span>
                </div>
            </div>

            {/* Progress */}
            <div className="w-full max-w-xs">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Cycle {currentCycle + 1} of {totalCycles}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    />
                </div>
            </div>

            {/* Controls */}
            <button
                onClick={() => {
                    if (isActive) {
                        setIsActive(false);
                        setPhase('inhale');
                        setCurrentCycle(0);
                        setProgress(0);
                    } else {
                        setIsActive(true);
                    }
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
                {isActive ? 'Stop' : 'Start Breathing'}
            </button>
        </div>
    );
};
