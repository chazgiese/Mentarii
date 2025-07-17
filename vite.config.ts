// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'ui',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: require('node:path').resolve(__dirname, 'ui/index.html'),
    },
  },
  plugins: [react()],
});