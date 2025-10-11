import axios from 'axios';

// Configure axios defaults for all requests
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to ensure origin header is set
apiClient.interceptors.request.use(
  (config) => {
    // Ensure origin header is set for CORS
    if (typeof window !== 'undefined') {
      config.headers['Origin'] = window.location.origin;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
