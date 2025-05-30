import axios from 'axios';
import { API_CONFIG } from '../config/api';

// API URL Configuration
const API_URL = API_CONFIG.BASE_URL;
console.log('API URL:', API_URL);

// Configure Axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000; // 10 seconds timeout

// Add request interceptor for debugging
axios.interceptors.request.use(config => {
  // Fix URL construction - prevent duplicate baseURL
  if (config.url && config.url.includes(config.baseURL || '')) {
    console.log('Warning: URL already contains baseURL - removing duplicated base URL');
    config.url = config.url.replace(config.baseURL || '', '');
  }
  
  console.log('Request URL:', config.url);
  console.log('Request Method:', config.method?.toUpperCase());
  console.log('Request Headers:', config.headers);
  if (config.data) {
    console.log('Request Data:', config.data);
  }
  return config;
}, error => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response Success:', response.status);
    return response;
  },
  error => {
    console.error('Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Set auth token for all axios requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Load token on page refresh
export const loadUser = async () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    setAuthToken(token);
    try {
      // Try to get user from API
      console.log('Getting user data from API with token...');
      const res = await axios.get('/api/auth/me');
      console.log('API user data received:', res.data);
      
      // Store the fresh user data in localStorage
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.error('Error loading user from API', err);
      
      // Check if we already have user data in localStorage
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        console.log('Using stored user data instead of API');
        // Use the stored user data as fallback
        return JSON.parse(storedUser);
      }
      
      // If no stored user, clear auth
      console.log('No stored user data, clearing authentication');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  // User must have both token and user data to be considered authenticated
  return token !== null && user !== null;
};

// Get current user from local storage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  console.log('Raw user data from localStorage:', userStr);
  
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      console.log('Parsed user data:', userData);
      // Log each field individually for debugging
      console.log('User fields:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        insurance: userData.insurance
      });
      return userData;
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('user');
      return null;
    }
  }
  console.log('No user data found in localStorage');
  return null;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setAuthToken(null);
  window.location.href = '/';
};

// Check server availability
export const checkServerAvailability = async () => {
  try {
    // Use /api/status endpoint instead of root endpoint
    const response = await axios.get('/api/status', { timeout: 3000 });
    console.log('Server availability check response:', response.data);
    return response.status === 200;
  } catch (error) {
    console.error('Server check failed:', error);
    return false;
  }
};