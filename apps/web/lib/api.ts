import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to set auth token
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Ensure Authorization header is set from defaults
        if (!config.headers.Authorization && api.defaults.headers.common['Authorization']) {
            config.headers.Authorization = api.defaults.headers.common['Authorization'];
        }
        console.log('API Request:', config.url, config.headers.Authorization ? 'With Auth' : 'No Auth');
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            // Server responded with error status
            if (error.response.status === 401) {
                // Token expired or invalid, sign out
                if (typeof window !== 'undefined') {
                    // Import signOut dynamically to avoid circular deps
                    const { signOut } = await import('next-auth/react');
                    await signOut({ callbackUrl: '/auth/login' });
                }
                return Promise.reject(new Error('Session expired. Please log in again.'));
            }
            const data = error.response.data;
            const message = (data && typeof data === 'object' && (data.detail || data.message)) ? (data.detail || data.message) : 'An error occurred';
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Request made but no response
            return Promise.reject(new Error('Network error. Please check your connection.'));
        } else {
            // Something else happened
            return Promise.reject(new Error('An unexpected error occurred'));
        }
    }
);

export default api;
