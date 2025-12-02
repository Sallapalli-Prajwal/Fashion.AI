// API Configuration
// In production, this will be set via environment variable at build time
// In development, it defaults to localhost
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export const config = {
  API_URL: API_URL,
  API_BASE: `${API_URL}/api`
};

export default config;


