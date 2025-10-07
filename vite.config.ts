import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // FIX: Suppress TypeScript error for process.cwd(). It's available in the Node.js
  // context where Vite config runs, but may not be typed correctly in some setups.
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Expose environment variables to the client according to project guidelines.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  }
})