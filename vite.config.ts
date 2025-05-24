import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Optional: enable strict file extension resolution
  // enforceExtension: false,

  // Optional: define environment variable prefix if using custom .env files
  // envPrefix: 'VITE_',

  // Optional: if you're targeting specific browsers, add build settings
  // build: {
  //   target: 'esnext',
  //   outDir: 'dist',
  //   sourcemap: true
  // }
});