// api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://eatandrun-back-production.up.railway.app/api',
});

// 👉 Agregamos el token a todas las peticiones automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('🔐 TOKEN A ENVIAR:', token); // 👈 debug
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default api;
