import React from 'react';
import { Button } from '../common/Button';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export const Hero: React.FC = () => {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-6"
                    >
                        Your Mind. Your Flow. <br /> Your Journey.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Experience the next evolution of mental wellness. AI-driven coaching, personalized details, and a design that breathes with you.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button size="lg" className="rounded-full px-8 py-6 text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                            Start Your Journey
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="lg" className="rounded-full px-8 py-6 text-lg hover:bg-gray-100/50">
                            <Play className="mr-2 h-5 w-5 fill-current" />
                            Watch Demo
                        </Button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="mt-20 relative mx-auto max-w-5xl"
                >
                    {/* Placeholder for 3D Mockup - mimicking the Apple style floating device */}
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-white aspect-[16/9] border border-gray-200/50 group">
                        <div className="absolute inset-0 bg-hero opacity-10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-400 font-medium">3D App Interface Mockup</span>
                        </div>
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>

                    {/* Floating elements behind */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </motion.div>
            </div>
        </section>
    );
};
