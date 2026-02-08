import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, HelpCircle } from 'lucide-react';
import { ProfileSection } from '../components/settings/ProfileSection';
import { NotificationsSection } from '../components/settings/NotificationsSection';
import { AppearanceSection } from '../components/settings/AppearanceSection';
import { PrivacySection } from '../components/settings/PrivacySection';
import { HelpSection } from '../components/settings/HelpSection';
import { cn } from '../lib/utils';

const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState('profile');

    const renderSection = () => {
        switch (activeSection) {
            case 'profile': return <ProfileSection />;
            case 'notifications': return <NotificationsSection />;
            case 'privacy': return <PrivacySection />;
            case 'appearance': return <AppearanceSection />;
            case 'help': return <HelpSection />;
            default: return <ProfileSection />;
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="pb-10"
        >
            {/* Header */}
            <motion.div variants={item} className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and preferences</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <motion.div variants={item} className="lg:w-64 shrink-0">
                    <nav className="bg-white rounded-2xl border border-gray-100 p-2 sticky top-24">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                                    activeSection === section.id
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <section.icon className="h-5 w-5" />
                                <span className="font-medium">{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </motion.div>

                {/* Content */}
                <motion.div variants={item} className="flex-1 space-y-6">
                    {renderSection()}
                </motion.div>
            </div>
        </motion.div>
    );
};
