import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiUrl = process.env['services__app__http__0'] ?? 'http://localhost:5000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to the Express service
      '/api': {
        target: apiUrl,
        changeOrigin: true
      }
    }
  }
});
