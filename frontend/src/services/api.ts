import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
});

// Interceptor para garantir que o TOKEN vá em todas as chamadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Verifique se o nome é 'token' mesmo
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;