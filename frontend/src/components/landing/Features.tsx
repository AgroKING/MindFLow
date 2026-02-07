import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Shield } from 'lucide-react';
import { Card } from '../common/Card';

const features = [
    {
        icon: <Activity className="w-8 h-8 text-blue-500" />,
        title: "AI-Powered Insights",
        description: "Smart mood tracking that learns from your patterns to provide actionable wellness advice."
    },
    {
        icon: <Brain className="w-8 h-8 text-purple-500" />,
        title: "Personalized Guidance",
        description: "Tailored wellness plans and meditation exercises designed specifically for your current state."
    },
    {
        icon: <Shield className="w-8 h-8 text-emerald-500" />,
        title: "Private & Secure",
        description: "Your mental health data is sensitive. We use end-to-end encryption to ensure it stays yours."
    }
];

export const Features: React.FC = () => {
    return (
        <section className="py-24 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card variant="glass" className="h-full p-8 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
                                <div className="mb-6 p-4 rounded-2xl bg-gray-50 inline-block group-hover:bg-white transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
