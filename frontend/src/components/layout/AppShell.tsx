import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Smile, MessageSquare, Settings, Menu, Bell, Search, Activity, BarChart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../common/Button';
import { MobileNav } from './MobileNav';
import { SkipToContent } from '../common/SkipToContent';
import { Toaster } from 'sonner';

export const AppShell: React.FC = () => {
    const location = useLocation();
    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
        { icon: Smile, label: 'Mood', path: '/mood' },
        { icon: BookOpen, label: 'Journal', path: '/journal' },
        { icon: MessageSquare, label: 'Coach', path: '/chat' },
        { icon: Activity, label: 'Activities', path: '/activities' },
        { icon: BarChart, label: 'Growth', path: '/progress' },
    ];

    return (
        <>
            <Toaster position="top-right" richColors theme="light" toastOptions={{ className: 'card-organic !rounded-2xl !border-none !bg-[#FDFBF7]' }} />
            <SkipToContent />
            <div className="flex h-screen bg-[#FDFBF7] text-[#2C2C2C] overflow-hidden font-sans relative selection:bg-[#E07A5F]/20">
                {/* Sidebar - Hidden on mobile */}
                <aside
                    className="w-[280px] bg-[#F8F5F0] border-r border-[#E6DCCD] flex-col hidden lg:flex z-20"
                    aria-label="Main navigation"
                >
                    <div className="p-8 pb-6 flex items-center gap-3">
                        <div className="h-10 w-10 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#E07A5F] rounded-full opacity-20 animate-[pulse_4s_ease-in-out_infinite]" />
                            <div className="absolute inset-0 bg-[#E07A5F] rounded-full opacity-20 scale-150 animate-[pulse_4s_ease-in-out_infinite_1s]" />
                            <span className="relative font-serif font-bold text-2xl text-[#E07A5F]">M</span>
                        </div>
                        <span className="text-2xl font-serif font-semibold tracking-tight text-[#2C2C2C]">MindFlow</span>
                    </div>

                    <nav className="flex-1 px-6 space-y-2 py-4" role="navigation">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "relative flex items-center gap-4 px-4 py-3.5 rounded-[16px] text-base transition-all duration-500 group overflow-hidden",
                                    isActive
                                        ? "text-[#2C2C2C] font-semibold bg-white shadow-sm ring-1 ring-[#E6DCCD]/50"
                                        : "text-[#595959] hover:text-[#2C2C2C] hover:bg-[#E6DCCD]/30"
                                )}
                                aria-current={location.pathname === item.path ? 'page' : undefined}
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Organic Active Indicator */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#E07A5F] rounded-r-full" />
                                        )}
                                        <item.icon className={cn("h-5 w-5 transition-transform duration-500 group-hover:scale-110", isActive ? "text-[#E07A5F] stroke-[2.5px]" : "text-[#94A89A]")} aria-hidden="true" />
                                        <span className="relative z-10">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-[#E6DCCD]/60">
                        <NavLink
                            to="/settings"
                            className={({ isActive }) => cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-[16px] text-base transition-all duration-300 group w-full",
                                isActive
                                    ? "text-[#2C2C2C] font-semibold bg-white shadow-sm"
                                    : "text-[#595959] hover:text-[#2C2C2C] hover:bg-[#E6DCCD]/30"
                            )}
                        >
                            <Settings className="h-5 w-5 text-[#94A89A] group-hover:rotate-45 transition-transform duration-700 ease-spring" aria-hidden="true" />
                            Settings
                        </NavLink>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#FDFBF7] relative">
                    {/* Organic Header */}
                    <header className="h-24 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 bg-[#FDFBF7]/80 backdrop-blur-md transition-all duration-200">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="lg:hidden min-w-[44px] min-h-[44px] hover:bg-[#E6DCCD]/30" aria-label="Toggle menu">
                                <Menu className="h-6 w-6 text-[#2C2C2C]" aria-hidden="true" />
                            </Button>

                            {/* Date/Greeting instead of Breadcrumb */}
                            <div className="hidden md:block">
                                <p className="font-hand text-xl text-[#94A89A] -rotate-2">Today is</p>
                                <h1 className="text-2xl font-serif text-[#2C2C2C]">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h1>
                            </div>
                        </div>

                        {/* Search Bar - Hidden on small screens, expands nicely */}
                        <div className="flex-1 max-w-sm mx-8 hidden lg:block">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A89A] group-focus-within:text-[#E07A5F] transition-colors" />
                                <input
                                    placeholder="Search your journal..."
                                    className="w-full bg-white border border-[#E6DCCD] rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all shadow-[2px_2px_0px_#E6DCCD] focus:shadow-none placeholder:text-[#595959]/40"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative text-[#595959] hover:text-[#E07A5F] hover:bg-[#E07A5F]/10 rounded-full w-12 h-12 transition-colors">
                                <Bell className="h-6 w-6" aria-hidden="true" />
                                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#E07A5F] ring-2 ring-[#FDFBF7]" />
                            </Button>

                            <button className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#E6DCCD] hover:border-[#E07A5F] transition-colors p-1">
                                <div className="w-full h-full bg-[#E6DCCD] rounded-full flex items-center justify-center text-[#595959] font-serif">
                                    <span className="text-lg">U</span>
                                </div>
                            </button>
                        </div>
                    </header>

                    <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-10 scroll-smooth pb-24 lg:pb-10 relative z-10">
                        <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Navigation - Should match organic style */}
            <MobileNav />
        </>
    );
};
