import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxies /api requests to the Express backend during local dev,
// so the React app can just call fetch('/api/...') with no CORS pain.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
