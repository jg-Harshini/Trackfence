import api from './api';
import { jwtDecode } from 'jwt-decode';

export const authService = {
    async login(username, password) {
        const response = await api.post('/auth/login', { username, password });
        const { token, userId, role, patientId } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ userId, username, role, patientId }));

        return response.data;
    },

    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    },

    getRole() {
        const user = this.getCurrentUser();
        return user?.role;
    }
};
