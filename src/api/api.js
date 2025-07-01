// api/api.js
import axios from 'axios';

// Detecta si estás en producción
const isProduction = import.meta.env.MODE === 'production';

const api = axios.create({
  baseURL: import.meta.env.MODE === 'production'
    ? 'https://eatandrun-back-production.up.railway.app/api'
    : 'http://localhost:4000/api', // 👈 desarrollo local
});

console.log('🌐 API BASE URL:', api.defaults.baseURL);



// 👉 Adjunta token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
