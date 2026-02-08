import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// Mock useAuth
const mockLogin = jest.fn();
const mockSignup = jest.fn();
const mockLogout = jest.fn();

jest.mock('../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: { name: 'Test User', email: 'test@example.com' },
        isLoading: false,
        login: mockLogin,
        signup: mockSignup,
        logout: mockLogout,
    }),
}));

// Mock navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => mockNavigation,
}));

// Import screens
import { LoginScreen } from '../src/screens/LoginScreen';
import { SignUpScreen } from '../src/screens/SignUpScreen';
import { DashboardScreen } from '../src/screens/DashboardScreen';
import { ActivitiesScreen } from '../src/screens/ActivitiesScreen';
import { JournalScreen } from '../src/screens/JournalScreen';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { MoodTrackerScreen } from '../src/screens/MoodTrackerScreen';

describe('Screens', () => {
    it('LoginScreen renders correctly', () => {
        const tree = ReactTestRenderer.create(<LoginScreen />).toJSON();
        expect(tree).toBeDefined();
    });

    it('SignUpScreen renders correctly', () => {
        const tree = ReactTestRenderer.create(<SignUpScreen />).toJSON();
        expect(tree).toBeDefined();
    });

    it('DashboardScreen renders correctly', () => {
        const tree = ReactTestRenderer.create(<DashboardScreen navigation={mockNavigation} />).toJSON();
        expect(tree).toBeDefined();
    });

    it('ActivitiesScreen renders correctly', () => {
        const tree = ReactTestRenderer.create(<ActivitiesScreen />).toJSON();
        expect(tree).toBeDefined();
    });

    it('JournalScreen renders correctly', () => {
        const tree = ReactTestRenderer.create(<JournalScreen />).toJSON();
        expect(tree).toBeDefined();
    });

    it('ProfileScreen renders correctly', () => {
        const tree = ReactTestRenderer.create(<ProfileScreen navigation={mockNavigation} />).toJSON();
        expect(tree).toBeDefined();
    });

    it('MoodTrackerScreen renders correctly', () => {
        const tree = ReactTestRenderer.create(<MoodTrackerScreen />).toJSON();
        expect(tree).toBeDefined();
    });
});
