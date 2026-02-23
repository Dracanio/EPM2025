import axios from 'axios';

const API_URL = `http://${window.location.hostname}:8080/api/v1`;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Basic ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
