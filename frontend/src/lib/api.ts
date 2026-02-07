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
    timeout: 10000, // 10s timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

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

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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

        // Don't show toast for 401 as we're handling it (or redirecting)
        // Also ensure we don't spam toasts for canceled requests
        if (error.response?.status !== 401 && error.code !== 'ERR_CANCELED') {
            // Optional: You might want to filter out specific 400 errors if they are form validation
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default api;
