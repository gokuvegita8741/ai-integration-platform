import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.detail || error.response.data?.message || 'An error occurred';
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
