import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { USE_PHYSICAL_DEVICE, PHYSICAL_DEVICE_IP, API_TIMEOUT } from '../config/api.config';

// API Base URL Configuration
// Edit mobile/src/config/api.config.js to change settings
const API_BASE_URL = USE_PHYSICAL_DEVICE 
  ? PHYSICAL_DEVICE_IP
  : (__DEV__ 
      ? Platform.OS === 'android' 
        ? 'http://10.0.2.2:5000/api'  // Android emulator
        : 'http://localhost:5000/api'  // iOS simulator
      : 'http://localhost:5000/api');  // Production

console.log('🔧 API Configuration:');
console.log('   Mode:', USE_PHYSICAL_DEVICE ? 'Physical Device' : 'Emulator/Simulator');
console.log('   URL:', API_BASE_URL);
console.log('   Platform:', Platform.OS);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API Timeout - Backend not responding');
    } else if (error.message === 'Network Error') {
      console.error('Network Error - Cannot reach backend. Check API URL and ensure backend is running.');
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - Token expired or invalid');
      // Clear tokens on 401 errors
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (email, password, role, startupName) => 
    api.post('/auth/signup', { email, password, role, startupName }),
};

export const tasksAPI = {
  getTasks: () => api.get('/tasks'),
  updateTaskStatus: (taskId, status) => api.put(`/tasks/${taskId}/status`, { status }),
};

export const milestonesAPI = {
  getMilestones: () => api.get('/milestones'),
};

export const healthAPI = {
  getHealthScore: () => api.get('/health'),
};

export const investorReadinessAPI = {
  getReadinessStatus: () => api.get('/investor-readiness'),
};

export const suggestionsAPI = {
  getSuggestions: () => api.get('/suggestions'),
};

export const decisionsAPI = {
  getDecisions: () => api.get('/decisions'),
};

export const assumptionsAPI = {
  getAssumptions: () => api.get('/assumptions'),
};

export default api;
