import axios from 'axios';

// Create axios instance WITHOUT baseURL
// This way you can keep using full URLs in your requests
const axiosInstance = axios.create();

// Request interceptor - automatically attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage
    const token = sessionStorage.getItem('token');

    // If token exists, add it to Authorization header
    if (token) {
      // Remove quotes if token was stored with JSON.stringify
      const cleanToken = token.replace(/^"|"$/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/auth/login')) {
      // Token expired or invalid - clear session and redirect to login
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Export as default so you can import it as 'axios'
export default axiosInstance;