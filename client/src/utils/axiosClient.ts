import axios from 'axios';
import { API_URL } from './api';

console.log('Using API URL:', API_URL);

// Create axios instance with base URL
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
axiosClient.interceptors.request.use(
  (config) => {
    // Log request details (for debugging)
    console.log(`Request to ${config.url}:`, {
      method: config.method,
      data: config.data
    });
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
          console.log('Added auth token to request');
        }
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axiosClient.interceptors.response.use(
  (response) => {
    console.log('Response from server:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Server error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      // If token is expired or invalid, clear local storage
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient; 