import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // Use relative base so assets work when served from a subpath or static host
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    // Manual chunking to improve initial bundle size and enable route/component splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return undefined;
          // Everything from node_modules -> vendor chunk
          if (id.includes('node_modules')) return 'vendor';

          // Large, rarely-used components / features get their own chunks
          if (id.includes('components/AIChat') || id.includes('AIChat')) return 'ai-chat';
          if (id.includes('components/VideoGenerator') || id.includes('VideoGenerator')) return 'video-generator';
          if (id.includes('components/AnimationCreator') || id.includes('AnimationCreator')) return 'animation-creator';
          if (id.includes('components/AvatarCreator') || id.includes('AvatarCreator')) return 'avatar-creator';

          // Route-ish splits (best-effort using path heuristics)
          if (id.includes('content-calendar') || id.includes('ContentCalendar')) return 'calendar';
          if (id.includes('Dashboard') || id.includes('dashboard')) return 'dashboard';
          if (id.includes('YouTubeAnalytics') || id.includes('youtube')) return 'youtube';

          return undefined;
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
