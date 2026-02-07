import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Activity, BookOpen, BarChart, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/mood', icon: Activity, label: 'Mood' },
    { to: '/journal', icon: BookOpen, label: 'Journal' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/progress', icon: BarChart, label: 'Progress' },
];

export const MobileNav: React.FC = () => {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#2E5266]/10 z-40 lg:hidden safe-area-pb shadow-[0_-4px_20px_rgba(46,82,102,0.05)]"
            aria-label="Mobile navigation"
        >
            <div className="flex items-center justify-around h-20 px-4 pb-2">
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center py-2 px-1 rounded-2xl w-full transition-all duration-300",
                            isActive
                                ? "text-[#7FA99B] -translate-y-1"
                                : "text-[#2E5266]/40 hover:text-[#2E5266]/70"
                        )}
                        aria-label={item.label}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "p-2 rounded-xl transition-all duration-300 mb-1",
                                    isActive ? "bg-[#7FA99B]/10" : "bg-transparent"
                                )}>
                                    <item.icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <span className="text-[10px] font-bold tracking-wide transition-opacity duration-300">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
