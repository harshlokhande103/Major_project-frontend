// API Base URL configuration
const config = {
  development: {
    apiBaseUrl: 'http://localhost:3000' // dev backend
  },
  production: {
    // Same-origin in production so `/api` hits the backend via Vercel rewrites
    // If you need to force an absolute URL, set VITE_API_BASE in env
    apiBaseUrl: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || ''
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';
export const apiBaseUrl = config[environment].apiBaseUrl;
export const apiUrl = (path = '') => {
  if (!path) return apiBaseUrl || '/';
  return `${apiBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
};