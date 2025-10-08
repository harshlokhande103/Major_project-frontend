// API Base URL configuration
const config = {
  // Development environment
  development: {
    apiBaseUrl: 'http://localhost:5001'
  },
  // Production environment (Vercel)
  production: {
    apiBaseUrl: 'https://major-project-backend-tau.vercel.app'
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';

// Export the configuration for current environment
export const apiBaseUrl = config[environment].apiBaseUrl;