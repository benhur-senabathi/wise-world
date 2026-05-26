import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared-resources'),
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  server: {
    port: 3017,
    proxy: {
      '/api/wise-rates': {
        target: 'https://wise.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wise-rates/, '/rates/live'),
      },
    },
  },
});
