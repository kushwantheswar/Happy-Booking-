import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      alert("CRITICAL ERROR: Cannot connect to the Backend server. Please make sure the Django server is running!");
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
