import React from 'react';
import { PenTool, MessageCircle, Activity, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
    { icon: PenTool, label: 'Write', path: '/journal', color: 'bg-[#E07A5F]/10 text-[#E07A5F]', border: 'border-[#E07A5F]/20' },
    { icon: MessageCircle, label: 'Chat', path: '/chat', color: 'bg-[#94A89A]/10 text-[#94A89A]', border: 'border-[#94A89A]/20' },
    { icon: Activity, label: 'Move', path: '/activities', color: 'bg-[#819FA0]/10 text-[#819FA0]', border: 'border-[#819FA0]/20' },
    { icon: BarChart2, label: 'Growth', path: '/progress', color: 'bg-[#D4A574]/10 text-[#D4A574]', border: 'border-[#D4A574]/20' },
];

export const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 gap-4">
            {ACTIONS.map((action, i) => (
                <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(action.path)}
                    className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                        action.border
                    )}
                >
                    <div className={cn("p-3 rounded-full mb-2", action.color)}>
                        <action.icon className="h-6 w-6" />
                    </div>
                    <span className="font-serif font-medium text-[#2C2C2C]">{action.label}</span>
                </motion.button>
            ))}
        </div>
    );
};
