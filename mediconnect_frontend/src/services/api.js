import axios from 'axios';

// This centralizes your backend URL so you don't have to type it everywhere
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Interceptor: This "intercepts" every outgoing request to the backend
// and attaches the JWT token from your browser's storage (if it exists).
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;