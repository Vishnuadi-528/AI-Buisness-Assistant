import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Dev server — proxy /api to local backend (development only, ignored on Vercel)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Ensure broad browser compatibility
    target: 'es2015',
    // Raise warning threshold — Recharts is large
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          'form-vendor':  ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor':    ['lucide-react', 'react-hot-toast', 'clsx'],
        },
      },
    },
  },
});
