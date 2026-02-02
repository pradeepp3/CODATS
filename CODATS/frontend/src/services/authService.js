import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('codats_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('codats_token');
          localStorage.removeItem('codats_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async signup(userData) {
    try {
      const response = await this.api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async scanCode(code, language) {
    try {
      const response = await this.api.post('/api/scan', { code, language });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Scan failed');
    }
  }

  async applyFix(code, vulnerability) {
    try {
      const response = await this.api.post('/api/fix', { code, vulnerability });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Fix failed');
    }
  }
}

export default new AuthService();