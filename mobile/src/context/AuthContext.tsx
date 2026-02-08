import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { User, LoginCredentials, SignupData, AuthResponse } from '../types/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const userData = await AsyncStorage.getItem('user_data');

            if (token && userData) {
                setUser(JSON.parse(userData));
                api.defaults.headers.common.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Failed to load auth', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            const { access_token, refresh_token, user: userData } = response.data;

            await AsyncStorage.setItem('auth_token', access_token);
            await AsyncStorage.setItem('refresh_token', refresh_token);
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));

            api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
            setUser(userData);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data: SignupData) => {
        setIsLoading(true);
        try {
            const response = await api.post<AuthResponse>('/auth/signup', data);
            const { access_token, refresh_token, user: userData } = response.data;

            await AsyncStorage.setItem('auth_token', access_token);
            await AsyncStorage.setItem('refresh_token', refresh_token);
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));

            api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
            setUser(userData);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Optional: Call logout endpoint
            // await api.post('/auth/logout'); 
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_data');
            delete api.defaults.headers.common.Authorization;
            setUser(null);
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
