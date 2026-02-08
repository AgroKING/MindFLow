import React, { useState } from 'react';
import { Search, Users, Wind, PenTool, Move, Circle, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/common/Button';
import { ActivityDetailModal, type Activity } from '../components/activities/ActivityDetailModal';

// Extended Mock Data
const ACTIVITIES: Activity[] = [
    {
        id: '1',
        title: 'Morning Meditation',
        category: 'Meditation',
        duration: '10 min',
        difficulty: 1,
        completedCount: '12k',
        icon: <Circle className="h-8 w-8 text-[#7FA99B]" />,
        description: 'Start your day with a calm, focused mind through guided meditation. Perfect for beginners to establish a routine.'
    },
    {
        id: '2',
        title: 'Box Breathing',
        category: 'Breathing',
        duration: '5 min',
        difficulty: 1,
        completedCount: '8.5k',
        icon: <Wind className="h-8 w-8 text-[#819FA0]" />,
        description: 'A simple technique to reduce stress and improve focus. Inhale, hold, exhale, hold - repeat for calm.'
    },
    {
        id: '3',
        title: 'Gratitude Journal',
        category: 'Journaling',
        duration: '15 min',
        difficulty: 1,
        completedCount: '20k',
        icon: <PenTool className="h-8 w-8 text-[#E07A5F]" />,
        description: 'Reflect on things you\'re grateful for to boost positivity. Write down three things that made you smile today.'
    },
    {
        id: '4',
        title: 'Body Scan',
        category: 'Meditation',
        duration: '20 min',
        difficulty: 2,
        completedCount: '5k',
        icon: <Circle className="h-8 w-8 text-[#7FA99B]" />,
        description: 'A systematic relaxation technique for deep awareness. Release tension from head to toe.'
    },
    {
        id: '5',
        title: 'Yoga Flow',
        category: 'Movement',
        duration: '25 min',
        difficulty: 2,
        completedCount: '3.2k',
        icon: <Move className="h-8 w-8 text-[#E9C46A]" />,
        description: 'Gentle movement to connect breath and body. suitable for all levels to stretch and strengthen.'
    },
    {
        id: '6',
        title: 'Evening Reflection',
        category: 'Journaling',
        duration: '10 min',
        difficulty: 1,
        completedCount: '15k',
        icon: <PenTool className="h-8 w-8 text-[#E07A5F]" />,
        description: 'Unwind and process your day before sleep. Clear your mind for a restful night.'
    },
];

const CATEGORIES = ['All', 'Meditation', 'Breathing', 'Movement', 'Journaling'];

export const Activities: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredActivities = ACTIVITIES.filter(activity => {
        const matchesCategory = activeCategory === 'All' || activity.category === activeCategory;
        const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getDifficultyLabel = (level: number) => {
        if (level === 1) return 'Beginner';
        if (level === 2) return 'Intermediate';
        return 'Advanced';
    };

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header */}
            <div>
                <h1 className="font-serif text-4xl md:text-5xl font-medium text-[#2C2C2C] mb-3 tracking-tight">Activities</h1>
                <p className="text-xl text-[#595959] font-sans max-w-2xl">Discover wellness exercises and practices tailored to your emotional journey.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A89A] group-focus-within:text-[#E07A5F] transition-colors duration-300">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search activities..."
                        className="w-full h-14 pl-14 pr-6 bg-white border border-[#E6DCCD] rounded-2xl text-lg text-[#2C2C2C] placeholder:text-[#595959]/40 focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] outline-none transition-all shadow-sm hover:shadow-md font-sans"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="flex gap-2 p-1.5 bg-white border border-[#E6DCCD] rounded-2xl shadow-sm h-14 items-center">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap h-full flex items-center",
                                    activeCategory === category
                                        ? "bg-[#E07A5F] text-white shadow-md"
                                        : "text-[#595959] hover:bg-[#E6DCCD]/30 hover:text-[#2C2C2C]"
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((activity) => (
                    <div
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className="group flex flex-col bg-white rounded-[24px] border border-[#E6DCCD] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[8px_16px_32px_rgba(224,122,95,0.12)] cursor-pointer relative"
                    >
                        {/* Organic blob decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-bl-[60%] -z-0 transition-transform duration-700 group-hover:scale-150" />

                        {/* Card Header */}
                        <div className="p-8 pb-4 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E6DCCD]/50 shadow-sm transition-transform duration-500 group-hover:rotate-6">
                                    {activity.icon}
                                </div>
                                <div className="px-3 py-1.5 bg-[#FAF8F5] rounded-full border border-[#E6DCCD] text-xs font-bold text-[#595959] uppercase tracking-wider">
                                    {activity.duration}
                                </div>
                            </div>

                            <h3 className="font-serif text-2xl font-medium text-[#2C2C2C] mb-3 leading-tight group-hover:text-[#E07A5F] transition-colors duration-300">
                                {activity.title}
                            </h3>
                            <p className="text-[#595959] text-base leading-relaxed line-clamp-2 font-sans">
                                {activity.description}
                            </p>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-auto p-8 pt-0 relative z-10">
                            <div className="flex justify-between items-center pt-6 border-t border-[#E6DCCD]/40">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-300", i < activity.difficulty ? "bg-[#E07A5F]" : "bg-[#E6DCCD]")} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-[#94A89A] ml-1">
                                        {getDifficultyLabel(activity.difficulty)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#595959]">
                                    <Users className="h-3.5 w-3.5" />
                                    {activity.completedCount}
                                </div>
                            </div>

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleActivityClick(activity);
                                }}
                                className="w-full mt-6 bg-[#FAF8F5] hover:bg-[#E07A5F] text-[#2C2C2C] hover:text-white border border-[#E6DCCD] hover:border-[#E07A5F] transition-all duration-300 shadow-sm"
                            >
                                <PlayCircle className="mr-2 h-5 w-5" />
                                Start Activity
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredActivities.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[32px] border border-[#E6DCCD] border-dashed">
                    <p className="text-xl text-[#94A89A] font-serif italic mb-2">No activities found matching your criteria.</p>
                    <p className="text-[#595959]">Try adjusting your search or filters.</p>
                </div>
            )}

            <ActivityDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activity={selectedActivity}
            />
        </div>
    );
};
