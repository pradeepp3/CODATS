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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Scan code for vulnerabilities
 * @param {string} code - Source code to scan
 * @param {string} language - Programming language (optional)
 * @returns {Promise} - Scan results
 */
const scanCode = async (code, language = 'javascript') => {
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
 * @param {File} file - File to upload and scan
 * @returns {Promise} - Scan results
 */
const scanFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/scan/file', formData, {
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
 * Apply a fix for a vulnerability
 * @param {string} code - Original code
 * @param {Object} vulnerability - Vulnerability object
 * @returns {Promise} - Fixed code
 */
const applyFix = async (code, vulnerability) => {
  try {
    const response = await api.post('/api/fix', { code, vulnerability });
    return response.data;
  } catch (error) {
    console.error('Apply fix error:', error);
    throw error.response?.data || { error: 'Failed to apply fix' };
  }
};

/**
 * Get AI-powered fix suggestions
 * @param {Object} vulnerability - Vulnerability object
 * @returns {Promise} - Fix suggestions
 */
const getFixSuggestions = async (vulnerability) => {
  try {
    const response = await api.post('/api/suggestions', { vulnerability });
    return response.data;
  } catch (error) {
    console.error('Get suggestions error:', error);
    throw error.response?.data || { error: 'Failed to get suggestions' };
  }
};

export default {
  scanCode,
  scanFile,
  applyFix,
  getFixSuggestions,
};

// Named exports for backward compatibility
export { scanCode, scanFile, applyFix, getFixSuggestions };