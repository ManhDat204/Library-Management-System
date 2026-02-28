import axios from 'axios';

// Base URL của backend
const BASE_URL = 'http://localhost:8080';

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor để tự động gắn token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu token hết hạn, xóa token và chuyển về login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;