import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, description }) => {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex-1">
                {label && <p className="font-medium text-gray-900">{label}</p>}
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    checked ? "bg-blue-600" : "bg-gray-200"
                )}
            >
                <motion.span
                    animate={{ x: checked ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
                />
            </button>
        </div>
    );
};
