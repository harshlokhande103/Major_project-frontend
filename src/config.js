// API Base URL configuration
const config = {
  development: {
    apiBaseUrl: 'http://localhost:3000' // dev backend
  },
  production: {
    // Use VITE_API_BASE (preferred) or VITE_API_URL from env; fallback to deployed backend URL
    apiBaseUrl: 'https://major-project-backend-chi.vercel.app'
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';
export const apiBaseUrl = config[environment].apiBaseUrl;
export const apiUrl = (path = '') => {
  if (!path) return apiBaseUrl || '/';
  return `${apiBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
};