import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL
});

// Automatically add token if it exists in localStorage
api.interceptors.request.use(config => {
    try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const data = JSON.parse(savedUser);
            // The token might be directly in data or in data.token
            const token = data.token || data;
            if (token && typeof token === 'string') {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Handle unauthorized responses globally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized request detected. Clearing session.');
            localStorage.removeItem('user');
            // If we are not on the login page and not on public pages, redirect
            const isPublicPage = window.location.pathname === '/login' ||
                window.location.pathname === '/feed' ||
                window.location.pathname === '/preview';
            if (!isPublicPage) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
