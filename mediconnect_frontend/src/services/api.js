import axios from 'axios';

// Centralizes backend URL
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// REQUEST INTERCEPTOR: Attaches token to outgoing requests
API.interceptors.request.use(
    (req) => {
        const token = localStorage.getItem('token');
        
        // Strict check to prevent sending literal 'undefined' or 'null' strings
        if (token && token !== 'undefined' && token !== 'null') {
            req.headers.Authorization = `Bearer ${token}`;
        }
        
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR: Handles global errors (like expired tokens)
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If the backend rejects the token (401 Unauthorized), log the user out automatically
        if (error.response && error.response.status === 401) {
            console.warn("Token expired or invalid. Logging out...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page (adjust the path if your login route is different)
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default API;