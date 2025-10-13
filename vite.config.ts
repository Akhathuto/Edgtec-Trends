import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This proxy is for local development when running `vite dev` alongside a
    // serverless function emulator like `vercel dev`.
    proxy: {
      '/api': {
        // Vercel's dev server typically runs on port 3000
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
