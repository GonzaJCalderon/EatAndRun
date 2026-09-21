// src/api/api.js
import axios from 'axios';

let baseURL;

if (window.location.hostname === 'localhost') {
  baseURL = 'http://localhost:4000/api';
} else {
  baseURL = 'https://eatandrun-back-production.up.railway.app/api';
}

console.log('🌍 API base URL detectada:', baseURL);

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
