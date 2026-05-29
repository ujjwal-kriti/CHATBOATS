import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'

// Set global base URL for production while allowing Vite proxy during local development
const baseURL = import.meta.env.MODE === 'production' ? window.location.origin + '/parent/chat/' : '';

// 1. Configure Axios
axios.defaults.baseURL = baseURL;

// Add Axios request interceptor to strip leading slash from relative URLs in production
if (import.meta.env.MODE === 'production') {
  axios.interceptors.request.use((config) => {
    if (config.url && config.url.startsWith('/api')) {
      config.url = config.url.substring(1); // Remove leading slash
    }
    return config;
  });
}

// 2. Configure Fetch (patch global fetch)
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    resource = baseURL ? (baseURL + resource.substring(1)) : resource;
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
