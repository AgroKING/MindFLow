import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PageSkeleton } from './components/common/Skeleton';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const MoodTracker = lazy(() => import('./pages/MoodTracker').then(m => ({ default: m.MoodTracker })));
const Journal = lazy(() => import('./pages/Journal').then(m => ({ default: m.Journal })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Activities = lazy(() => import('./pages/Activities').then(m => ({ default: m.Activities })));
const Progress = lazy(() => import('./pages/Progress').then(m => ({ default: m.Progress })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const SignUp = lazy(() => import('./pages/SignUp').then(m => ({ default: m.SignUp })));

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            { index: true, element: <SuspenseWrapper><Home /></SuspenseWrapper> },
            { path: 'dashboard', element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
            { path: 'mood', element: <SuspenseWrapper><MoodTracker /></SuspenseWrapper> },
            { path: 'journal', element: <SuspenseWrapper><Journal /></SuspenseWrapper> },
            { path: 'chat', element: <SuspenseWrapper><Chat /></SuspenseWrapper> },
            { path: 'activities', element: <SuspenseWrapper><Activities /></SuspenseWrapper> },
            { path: 'progress', element: <SuspenseWrapper><Progress /></SuspenseWrapper> },
            { path: 'settings', element: <SuspenseWrapper><Settings /></SuspenseWrapper> },
        ],
    },
    { path: '/login', element: <SuspenseWrapper><Login /></SuspenseWrapper> },
    { path: '/signup', element: <SuspenseWrapper><SignUp /></SuspenseWrapper> },
]);
