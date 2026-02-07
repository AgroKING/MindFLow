import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

const ACTIVITIES = [
    { type: 'journal', title: 'Evening Reflection', time: '8:30 PM', emoji: '🌙', color: 'bg-[#D4A574]/10 text-[#D4A574]' },
    { type: 'mood', title: 'Feeling Great', time: '2:15 PM', emoji: '🤩', color: 'bg-[#2A9D8F]/10 text-[#2A9D8F]' },
    { type: 'meditation', title: '10 min Mindfulness', time: '8:00 AM', emoji: '🧘', color: 'bg-[#7FA99B]/10 text-[#7FA99B]' },
    { type: 'mood', title: 'Morning Check-in', time: '7:45 AM', emoji: '😐', color: 'bg-[#2E5266]/10 text-[#2E5266]' },
];

export const RecentActivity: React.FC = () => {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-[var(--shadow-md)] border border-[#2E5266]/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-semibold text-[#2E5266]">Recent Activity</h3>
                <button className="p-2 hover:bg-[#F8F5F2] rounded-full transition-colors group">
                    <ArrowRight className="h-5 w-5 text-[#2E5266]/40 group-hover:text-[#2E5266]" />
                </button>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#7FA99B] before:to-[#7FA99B]/20">
                {ACTIVITIES.map((activity, i) => (
                    <div key={i} className="relative group cursor-pointer">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute left-[-29px] top-1 h-4 w-4 rounded-full border-[3px] border-white shadow-sm transition-all duration-300 z-10",
                            "bg-[#7FA99B] group-hover:scale-125 group-hover:bg-[#D4A574]"
                        )} />

                        <div className="flex items-center justify-between p-3 -m-3 rounded-xl transition-all duration-300 hover:bg-[#F8F5F2] hover:translate-x-1">
                            <div>
                                <h4 className="font-medium text-[#2E5266] group-hover:text-[#2E5266]">
                                    {activity.title}
                                </h4>
                                <p className="font-mono text-xs text-[#2E5266]/50 mt-1 uppercase tracking-wide">{activity.time}</p>
                            </div>
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110",
                                activity.color
                            )}>
                                {activity.emoji}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
