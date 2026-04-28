// frontend/src/utils/api.js
// Axios instance — automatically attaches JWT and handles 401
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,  // 60s — Render free tier cold start can take 30-50s
});

// Attach token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — only redirect on /auth/me (session expired), not on other endpoints
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      // Only force-redirect when the session check itself fails (expired token)
      if (url.includes('/auth/me')) {
        localStorage.removeItem('cq_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
