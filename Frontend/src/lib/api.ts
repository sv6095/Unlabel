import axios from 'axios';

// Use environment variable for API URL, fallback to production backend or localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://unlabel.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
