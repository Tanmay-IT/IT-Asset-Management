import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // localStorage unavailable (e.g. private browsing) — request goes out unauthenticated
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('auth-token');
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
