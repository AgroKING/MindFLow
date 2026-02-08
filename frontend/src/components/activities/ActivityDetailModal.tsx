import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { X, Clock, Users, Award, PlayCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface Activity {
    id: string;
    title: string;
    category: string;
    duration: string;
    difficulty: number;
    description: string;
    icon: React.ReactNode;
    completedCount: string;
}

interface ActivityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Activity | null;
}

const STEPS = [
    'Find a quiet space where you won\'t be disturbed.',
    'Sit comfortably with your back straight.',
    'Close your eyes and take a few deep breaths.',
    'Focus on the sensation of your breath.',
    'If your mind wanders, gently bring it back.',
];

const BENEFITS = [
    'Reduces stress and cortisol levels',
    'Improves focus and mental clarity',
    'Promotes emotional balance',
    'Enhances self-awareness',
];

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ isOpen, onClose, activity }) => {
    const [isStarted, setIsStarted] = useState(false);
    const { theme } = useTheme();

    if (!activity) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#2C2C2C]/20 backdrop-blur-sm z-50 transition-all"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-[#FDFBF7] rounded-[32px] shadow-2xl z-50 overflow-hidden flex flex-col border border-[#E6DCCD] max-h-[90vh]"
                    >
                        {/* Organic Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E07A5F]/5 rounded-blob mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />

                        {/* Header */}
                        <div className="relative p-8 pb-6 border-b border-[#E6DCCD]/60">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white rounded-2xl border border-[#E6DCCD] shadow-sm text-[#E07A5F]">
                                    {activity.icon}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="rounded-full hover:bg-[#E6DCCD]/20 text-[#94A89A] hover:text-[#2C2C2C]"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <h2 className="font-serif text-3xl md:text-4xl text-[#2C2C2C] mb-2">{activity.title}</h2>
                            <p className="text-[#595959] text-lg font-sans leading-relaxed">{activity.description}</p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-[#E6DCCD] text-sm text-[#595959]">
                                    <Clock className="h-4 w-4 text-[#E07A5F]" />
                                    {activity.duration}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-[#E6DCCD] text-sm text-[#595959]">
                                    <Award className="h-4 w-4 text-[#E9C46A]" />
                                    {activity.difficulty === 1 ? 'Beginner' : activity.difficulty === 2 ? 'Intermediate' : 'Advanced'}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-[#E6DCCD] text-sm text-[#595959]">
                                    <Users className="h-4 w-4 text-[#819FA0]" />
                                    {activity.completedCount} done
                                </div>
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
                            {!isStarted ? (
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Steps */}
                                    <div className="space-y-4">
                                        <h3 className="font-serif text-xl text-[#2C2C2C]">How to practice</h3>
                                        <ol className="space-y-4">
                                            {STEPS.map((step, i) => (
                                                <li key={i} className="flex gap-4 group">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] flex items-center justify-center font-serif font-bold group-hover:bg-[#E07A5F] group-hover:text-white transition-colors duration-300">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-[#595959] leading-relaxed pt-1 group-hover:text-[#2C2C2C] transition-colors">
                                                        {step}
                                                    </p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Benefits */}
                                    <div className="space-y-4">
                                        <h3 className="font-serif text-xl text-[#2C2C2C]">Benefits</h3>
                                        <ul className="space-y-3">
                                            {BENEFITS.map((benefit, i) => (
                                                <li key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-[#E6DCCD]/40">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#94A89A]" />
                                                    <span className="text-[#595959]">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                                    <div className="w-24 h-24 rounded-full bg-[#E07A5F]/10 flex items-center justify-center animate-pulse">
                                        <Clock className="w-10 h-10 text-[#E07A5F]" />
                                    </div>
                                    <h3 className="font-serif text-2xl text-[#2C2C2C]">Session in Progress</h3>
                                    <p className="text-[#595959] max-w-sm mx-auto">Focus on your breathing. We'll let you know when the time is up.</p>
                                    <Button
                                        onClick={() => {
                                            setIsStarted(false);
                                            // Play completion sound based on theme
                                            const audio = new Audio(
                                                theme === 'star-wars' ? '/sounds/lightsaber-clash.mp3' : // or a dedicated completion sound
                                                    theme === 'barbie' ? '/sounds/pop-sparkle.mp3' :
                                                        '/sounds/success-chime.mp3'
                                            );
                                            audio.volume = 0.5;
                                            audio.play().catch(() => { });
                                        }}
                                        variant="outline"
                                        className="mt-4 border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F]/5"
                                    >
                                        End Session
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        {!isStarted && (
                            <div className="p-6 border-t border-[#E6DCCD]/60 bg-[#FAF8F5]">
                                <Button
                                    onClick={() => setIsStarted(true)}
                                    className="w-full h-14 text-lg bg-[#E07A5F] hover:bg-[#D48C70] text-white rounded-2xl shadow-lg shadow-[#E07A5F]/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <PlayCircle className="mr-2 h-6 w-6" />
                                    Start Session
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
