// src/api/api.js
import axios from 'axios';

// ✅ En producción usa la variable de entorno de Vite
// En desarrollo usa localhost si no hay variable definida
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL });

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
