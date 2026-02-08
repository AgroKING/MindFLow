import React from 'react';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { MoodCheckIn } from '../components/dashboard/MoodCheckIn';
import { InsightsChart } from '../components/dashboard/InsightsChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { QuoteCarousel } from '../components/dashboard/QuoteCarousel';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15 // Slower stagger for journal feel
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 50, damping: 20 }
    }
};

export const Dashboard: React.FC = () => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10 max-w-7xl mx-auto"
        >
            {/* Hero Section - Intimate Greeting */}
            <motion.div variants={item} className="w-full">
                <WelcomeBanner />
            </motion.div>

            {/* Philosophical Quote Carousel */}
            <motion.div variants={item} className="w-full">
                <QuoteCarousel />
            </motion.div>

            {/* Asymmetric Masonry-ish Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Main Column - Emotional Center */}
                <div className="lg:col-span-7 space-y-8">
                    <motion.div variants={item}>
                        <MoodCheckIn />
                    </motion.div>

                    <motion.div variants={item} className="h-[400px]">
                        <div className="card-organic p-6 relative overflow-hidden h-full">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-serif text-xl text-[#2C2C2C]">Emotional Patterns</h3>
                                <select className="bg-transparent border-none text-sm font-bold text-[#94A89A] focus:ring-0 cursor-pointer hover:text-[#E07A5F] transition-colors">
                                    <option>This Week</option>
                                    <option>Last Month</option>
                                </select>
                            </div>
                            <div className="h-[320px] w-full">
                                <InsightsChart />
                            </div>
                            {/* Paper Texture Overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Context & Actions */}
                <div className="lg:col-span-5 space-y-8 flex flex-col">
                    {/* Quick Actions - Sticker/Badge style */}
                    <motion.div variants={item}>
                        <div className="bg-[#FAF8F5] border border-[#E6DCCD] rounded-3xl p-6 shadow-sm relative overflow-hidden">
                            {/* Decorative Tape */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#E6DCCD]/40 rotate-1 backdrop-blur-sm transform skew-x-12" />

                            <h3 className="font-serif text-lg text-[#2C2C2C] mb-4 text-center">Gentle Actions</h3>
                            <QuickActions />
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="flex-1">
                        <RecentActivity />
                    </motion.div>

                    {/* Simple Goal/Reminder Card - Handwritten Note */}
                    <motion.div variants={item}>
                        <div className="bg-[#E9C46A]/20 border border-[#E9C46A]/30 rounded-blob p-6 relative transform rotate-1 hover:rotate-0 transition-transform duration-500 shadow-sm">
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#E9C46A] rounded-full opacity-20 blur-xl" />
                            <h3 className="font-hand text-2xl text-[#D48C70] mb-2 font-bold">Remember...</h3>
                            <p className="font-serif italic text-[#595959] leading-relaxed">
                                "Growth is not a race. You are allowed to rest."
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
