import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/content': 'http://localhost:5000',
      '/services': 'http://localhost:5000',
      '/case-studies': 'http://localhost:5000',
      '/testimonials': 'http://localhost:5000',
      '/faqs': 'http://localhost:5000',
      '/stats': 'http://localhost:5000',
      '/leads': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
