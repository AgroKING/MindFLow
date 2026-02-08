import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL configuration
// For Android Emulator: http://10.0.2.2:8000
// For iOS Simulator: http://localhost:8000
const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:8000/api',
    ios: 'http://localhost:8000/api',
    default: 'http://localhost:8000/api',
});

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token } = response.data;
                await AsyncStorage.setItem('auth_token', access_token);

                api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                processQueue(null, access_token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await AsyncStorage.removeItem('auth_token');
                await AsyncStorage.removeItem('refresh_token');
                // Navigation to login should be handled by AuthContext listener or Event Emitter
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
