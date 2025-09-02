import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [react()],
  server: {
    port: parseInt(process.env.FRONTEND_PORT || '5173'),
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || `http://localhost:${process.env.BACKEND_PORT || '3000'}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
