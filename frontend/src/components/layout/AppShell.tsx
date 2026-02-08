import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Smile, MessageSquare, Settings, Menu, Bell, Search, Activity, BarChart, Palette } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../common/Button';
import { MobileNav } from './MobileNav';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { NotificationsPanel } from './NotificationsPanel';
import { SkipToContent } from '../common/SkipToContent';
import { Toaster } from 'sonner';

export const AppShell: React.FC = () => {
    const location = useLocation();
    const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const hasUnreadNotifications = false; // Mock state
    const themeSwitcherRef = useRef<HTMLDivElement>(null);

    // Auto-close theme switcher after 30 seconds or when clicking outside
    useEffect(() => {
        if (!showThemeSwitcher) return;

        // 30-second timeout
        const timeoutId = setTimeout(() => {
            setShowThemeSwitcher(false);
        }, 30000);

        // Click outside handler
        const handleClickOutside = (event: MouseEvent) => {
            if (themeSwitcherRef.current && !themeSwitcherRef.current.contains(event.target as Node)) {
                setShowThemeSwitcher(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showThemeSwitcher]);

    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
        { icon: Smile, label: 'Mood', path: '/mood' },
        { icon: BookOpen, label: 'Journal', path: '/journal' },
        { icon: MessageSquare, label: 'Coach', path: '/chat' },
        { icon: Activity, label: 'Activities', path: '/activities' },
        { icon: BarChart, label: 'Growth', path: '/progress' },
        { icon: Palette, label: 'Playground', path: '/playground' },
    ];

    return (
        <>
            <Toaster position="top-right" richColors theme="light" toastOptions={{ className: 'bg-card text-foreground border-border rounded-lg' }} />
            <SkipToContent />
            <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative selection:bg-primary/20">
                {/* Sidebar - Hidden on mobile */}
                <aside
                    className="w-[280px] bg-secondary/50 border-r border-border flex flex-col hidden lg:flex z-20 transition-colors duration-300"
                    aria-label="Main navigation"
                >
                    <div className="flex items-center gap-3 px-6 py-8">
                        {/* High-Resolution Logo Component */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/30 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-primary/20 text-primary shadow-xl overflow-hidden ring-4 ring-background">
                                <svg viewBox="0 0 40 40" className="w-8 h-8 fill-current">
                                    <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5ZM20 32C13.3726 32 8 26.6274 8 20C8 13.3726 13.3726 8 20 8C26.6274 8 32 13.3726 32 20C32 26.6274 26.6274 32 20 32Z" opacity="0.2" />
                                    <path d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10ZM14 20C14 16.6863 16.6863 14 20 14C23.3137 14 26 16.6863 26 20C26 23.3137 23.3137 26 20 26C16.6863 26 14 23.3137 14 20Z" />
                                    <path d="M20 16C17.7909 16 16 17.7909 16 20C16 22.2091 17.7909 24 20 24C22.2091 24 24 22.2091 24 20C24 17.7909 22.2091 16 20 16Z" className="animate-pulse" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-serif font-bold tracking-tight text-foreground leading-tight">MindFlow</span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Premium Wellness</span>
                        </div>
                    </div>

                    <nav className="flex-1 px-6 space-y-2 py-4 overflow-y-auto" role="navigation">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "relative flex items-center gap-4 px-4 py-3.5 rounded-md text-base transition-all duration-300 group overflow-hidden",
                                    isActive
                                        ? "text-primary-foreground font-semibold bg-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-neutral/5"
                                )}
                                aria-current={location.pathname === item.path ? 'page' : undefined}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={cn("h-5 w-5 transition-transform duration-500 group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} aria-hidden="true" />
                                        <span className="relative z-10">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-border space-y-4">
                        {/* Theme Switcher Toggle */}
                        <div className="relative" ref={themeSwitcherRef}>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={() => setShowThemeSwitcher(!showThemeSwitcher)}
                            >
                                <Palette className="h-4 w-4" />
                                Customize Theme
                            </Button>
                            {showThemeSwitcher && (
                                <div className="absolute bottom-full left-0 mb-2 w-full z-50 animate-in fade-in slide-in-from-bottom-2">
                                    <ThemeSwitcher />
                                </div>
                            )}
                        </div>

                        <NavLink
                            to="/settings"
                            className={({ isActive }) => cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-md text-base transition-all duration-300 group w-full",
                                isActive
                                    ? "text-primary-foreground font-semibold bg-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-neutral/5"
                            )}
                        >
                            <Settings className="h-5 w-5 text-muted-foreground group-hover:rotate-45 transition-transform duration-700 ease-spring" aria-hidden="true" />
                            Settings
                        </NavLink>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-background relative transition-colors duration-300">
                    {/* Organic Header */}
                    <header className="h-24 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 bg-background/80 backdrop-blur-md transition-all duration-200 border-b border-border/10">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="lg:hidden min-w-[44px] min-h-[44px]" aria-label="Toggle menu">
                                <Menu className="h-6 w-6 text-foreground" aria-hidden="true" />
                            </Button>

                            {/* Date/Greeting */}
                            <div className="hidden md:block">
                                <p className="font-hand text-xl text-muted-foreground -rotate-2">Today is</p>
                                <h1 className="text-2xl font-serif text-foreground">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h1>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-sm mx-8 hidden lg:block">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    placeholder="Search your journal..."
                                    className="w-full bg-input border border-border rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm focus:shadow-none placeholder:text-muted-foreground/50 text-foreground"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full w-12 h-12 transition-colors"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell className="h-6 w-6" aria-hidden="true" />
                                {hasUnreadNotifications && (
                                    <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
                                )}
                            </Button>

                            <NotificationsPanel
                                isOpen={showNotifications}
                                onClose={() => setShowNotifications(false)}
                            />

                            <button className="h-12 w-12 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors p-1">
                                <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center text-foreground font-serif">
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

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </>
    );
};
