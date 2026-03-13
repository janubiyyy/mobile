import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'https://sakubumi-api.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: sisipkan token JWT di setiap request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: tangani error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    // Ganti pesan network error menjadi lebih jelas
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      error.message = 'Tidak dapat menghubungi server. Periksa koneksi internet kamu.';
    }
    return Promise.reject(error);
  }
);

export default api;
