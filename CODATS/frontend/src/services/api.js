import axios from 'axios';

// Use empty string for baseURL to leverage Vite's proxy in development
// In production, set VITE_API_URL to the actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Scan code for vulnerabilities
 * @param {string} code - Source code to scan
 * @param {string} language - Programming language
 * @returns {Promise} - Scan results
 */
export const scanCode = async (code, language = 'javascript') => {
  try {
    const response = await api.post('/api/scan', { code, language });
    return response.data;
  } catch (error) {
    console.error('Scan error:', error);
    throw error.response?.data || { error: 'Failed to scan code' };
  }
};

/**
 * Upload and scan a file
 * @param {File} file - File to upload
 * @returns {Promise} - Scan results
 */
export const scanFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/scan/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('File scan error:', error);
    throw error.response?.data || { error: 'Failed to scan file' };
  }
};

/**
 * Get AI fix for a vulnerability
 * @param {Object} vulnerability - Vulnerability details
 * @param {string} code - Source code
 * @returns {Promise} - Fix recommendation
 */
export const getFix = async (vulnerability, code) => {
  try {
    const response = await api.post('/api/fix', { vulnerability, code });
    return response.data;
  } catch (error) {
    console.error('Get fix error:', error);
    throw error.response?.data || { error: 'Failed to get fix' };
  }
};

/**
 * Get supported languages
 * @returns {Promise} - List of languages
 */
export const getLanguages = async () => {
  try {
    const response = await api.get('/api/languages');
    return response.data;
  } catch (error) {
    console.error('Get languages error:', error);
    throw error.response?.data || { error: 'Failed to get languages' };
  }
};

/**
 * Get vulnerability rules
 * @returns {Promise} - List of rules
 */
export const getRules = async () => {
  try {
    const response = await api.get('/api/rules');
    return response.data;
  } catch (error) {
    console.error('Get rules error:', error);
    throw error.response?.data || { error: 'Failed to get rules' };
  }
};

/**
 * Health check
 * @returns {Promise} - Health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error.response?.data || { error: 'API is not available' };
  }
};

export default api;
