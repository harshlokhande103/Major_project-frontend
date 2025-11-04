// API Base URL configuration
export const apiBaseUrl = 'https://major-project-backend-chi.vercel.app';

// Use this code block to set the API base URL based on the current environment
// const config = {
//   development: {
//     apiBaseUrl: 'http://localhost:3000' // dev backend
//   },
//   production: {
//     apiBaseUrl: 'https://major-project-backend-chi.vercel.app'
//   }
// };

// const environment = import.meta.env.MODE || 'development';
// export const apiBaseUrl = config[environment].apiBaseUrl;

export const apiUrl = (path = '') => {
  if (!path) return apiBaseUrl || '/';
  return `${apiBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
};