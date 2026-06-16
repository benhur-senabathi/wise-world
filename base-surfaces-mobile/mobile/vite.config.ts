import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.riv'],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared-resources'),
      '@animations': path.resolve(__dirname, '../../animations'),
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  server: {
    port: 3017,
    fs: {
      allow: [path.resolve(__dirname, '../..')],
    },
    proxy: {
      '/api/wise-rates': {
        target: 'https://wise.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wise-rates/, '/rates/live'),
      },
    },
  },
});
