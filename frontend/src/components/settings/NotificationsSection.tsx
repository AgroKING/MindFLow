import React, { useState } from 'react';
import { Card } from '../common/Card';
import { ToggleSwitch } from './ToggleSwitch';
import { Clock } from 'lucide-react';

export const NotificationsSection: React.FC = () => {
    const [settings, setSettings] = useState({
        dailyReminders: true,
        achievements: true,
        aiCoach: true,
        emailDigest: false,
    });

    const [reminderTime, setReminderTime] = useState('09:00');

    const updateSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Notifications</h2>

            <div className="divide-y divide-gray-100">
                <ToggleSwitch
                    checked={settings.dailyReminders}
                    onChange={() => updateSetting('dailyReminders')}
                    label="Daily Check-in Reminders"
                    description="Get a gentle reminder to log your mood"
                />
                <ToggleSwitch
                    checked={settings.achievements}
                    onChange={() => updateSetting('achievements')}
                    label="Achievement Notifications"
                    description="Celebrate when you unlock new badges"
                />
                <ToggleSwitch
                    checked={settings.aiCoach}
                    onChange={() => updateSetting('aiCoach')}
                    label="AI Coach Messages"
                    description="Receive personalized insights and tips"
                />
                <ToggleSwitch
                    checked={settings.emailDigest}
                    onChange={() => updateSetting('emailDigest')}
                    label="Weekly Email Digest"
                    description="Get a summary of your progress via email"
                />
            </div>

            {settings.dailyReminders && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4" />
                        Reminder Time
                    </label>
                    <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </div>
            )}
        </Card>
    );
};
