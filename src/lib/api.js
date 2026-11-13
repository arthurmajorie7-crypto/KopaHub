import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kopahub_token') || sessionStorage.getItem('kopahub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
