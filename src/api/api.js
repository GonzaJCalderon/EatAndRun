// api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// 👉 Agregamos el token a todas las peticiones automáticamente
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
