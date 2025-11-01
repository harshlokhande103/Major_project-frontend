// API Base URL configuration
const config = {
  development: {
    apiBaseUrl: 'http://localhost:3000' // dev backend
  },
  production: {
    // Use VITE_API_BASE from Render/Vercel env; fallback to deployed backend URL
    apiBaseUrl: import.meta.env.VITE_API_BASE || 'https://major-project-backend-gu3c.onrender.com'
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';
export const apiBaseUrl = config[environment].apiBaseUrl;
export const apiUrl = (path = '') => {
  if (!path) return apiBaseUrl || '/';
  return `${apiBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
};