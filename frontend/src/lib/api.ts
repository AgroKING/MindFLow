import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
    type AxiosResponse
} from 'axios';
import { toast } from 'sonner';

// Define standard API response wrapper if backend uses one
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success?: boolean;
}

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 45000, // 45s default timeout to handle AI delays
});

// Dedicated instance for AI/Long-running requests with extended timeout
export const aiApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60s timeout for AI generation
});

// Exponential Backoff Utility
export const exponentialBackoff = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return exponentialBackoff(fn, retries - 1, delay * 2);
    }
};

const attachInterceptors = (instance: typeof api) => {
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem('auth_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

attachInterceptors(api);
attachInterceptors(aiApi);

// Flag to prevent multiple simultaneous refresh attempts
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

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
};

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // Handle 401 Unauthorized (Token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh token endpoint
                const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token } = response.data;
                localStorage.setItem('auth_token', access_token);

                // Update default header for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                processQueue(null, access_token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Logout user if refresh fails
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Global error handling with toast
        const errorMessage = (error.response?.data as any)?.detail || (error.response?.data as any)?.message || error.message || 'Something went wrong';

        // Smart Network Error Handling
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
            // 1. Check if browser reports online status
            if (!navigator.onLine) {
                // Truly offline - show gentle message once
                const now = Date.now();
                const lastErrorTime = parseInt(localStorage.getItem('last_network_error_time') || '0');
                const TIME_THRESHOLD = 30000; // 30 seconds between toasts

                if (now - lastErrorTime > TIME_THRESHOLD) {
                    toast.info("You're offline. Changes will be saved locally.", {
                        duration: 3000,
                    });
                    localStorage.setItem('last_network_error_time', now.toString());
                }
                return Promise.reject(error);
            }

            // 2. Browser says online - try silent retry once
            if (!originalRequest._retryCount) {
                originalRequest._retryCount = 1;
                console.log('Network issue detected, attempting silent retry...');

                // Wait 500ms before retry
                await new Promise(resolve => setTimeout(resolve, 500));
                return api(originalRequest);
            }

            // 3. Retry failed - might be backend down
            console.warn('Backend may be unavailable. Saving locally.');
            return Promise.reject(error);
        }

        // Other errors - show only for non-401 and non-network
        if (error.response?.status !== 401) {
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default api;
