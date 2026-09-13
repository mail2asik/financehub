import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://api-financehub.asik.local',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to extract API error messages from response payloads
export const parseApiError = (error: unknown): string[] => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (Array.isArray(data.message)) {
      return data.message;
    }
    if (typeof data.message === 'string') {
      return [data.message];
    }
  }
  return ['An unexpected error occurred. Please try again.'];
};