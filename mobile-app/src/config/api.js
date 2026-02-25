import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Backend API URL configuration
// Update this based on your setup:
// - iOS Simulator: http://localhost:5000/api
// - Android Emulator: http://10.0.2.2:5000/api
// - Physical Device: http://YOUR_COMPUTER_IP:5000/api (e.g., http://10.252.116.162:5000/api)
// 
// You can also set EXPO_PUBLIC_API_URL in .env file

const getApiUrl = () => {
  // Check if API_URL is set in environment variables
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Your computer's IP address (update this if it changes)
  const COMPUTER_IP = '10.252.116.162';
  
  // Default configuration
  // For physical devices, you MUST use your computer's IP address
  // Make sure your phone and computer are on the same WiFi network
  if (Platform.OS === 'android') {
    // Try physical device IP first (most common case)
    // If using Android Emulator, change this to 'http://10.0.2.2:5000/api'
    return `http://${COMPUTER_IP}:5000/api`;
  }
  
  // iOS: Use IP for physical device, localhost for simulator
  // If using iOS Simulator, change this to 'http://localhost:5000/api'
  return `http://${COMPUTER_IP}:5000/api`;
};

const API_URL = getApiUrl();

// Log the API URL for debugging (remove in production)
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
    }
    
    // Better error messages for network issues
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        url: API_URL,
        platform: Platform.OS,
      });
      error.message = `Cannot connect to server. Please check:\n1. Backend is running\n2. Correct API URL: ${API_URL}\n3. Same WiFi network (for physical device)`;
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
