import axios from 'axios';

// All requests go through the /api prefix, which Vite proxies to the
// Express backend in dev, and which CloudFront/EC2 will serve directly
// once deployed (same origin, no CORS needed in production either).
const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
