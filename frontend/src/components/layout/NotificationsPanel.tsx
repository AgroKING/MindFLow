import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning';
}

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    // Mock notifications for demo
    const notifications: Notification[] = [
        // {
        //     id: '1',
        //     title: 'Welcome to MindFlow',
        //     message: 'Start your journey by logging your first mood check-in.',
        //     time: '2 hours ago',
        //     read: false,
        //     type: 'info'
        // }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/5 lg:hidden"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {notifications.length > 0 && (
                                <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-blue-600 hover:text-blue-700">
                                    Mark all as read
                                </Button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                                                !notification.read && "bg-blue-50/30"
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                    notification.type === 'info' ? "bg-blue-100 text-blue-600" :
                                                        notification.type === 'success' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                                                )}>
                                                    {notification.type === 'success' ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={cn("text-sm font-medium", !notification.read ? "text-gray-900" : "text-gray-700")}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 px-6 flex flex-col items-center justify-center text-center text-gray-500">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Bell className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-900 mb-1">No notifications</p>
                                    <p className="text-sm">You're all caught up! Check back later.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
