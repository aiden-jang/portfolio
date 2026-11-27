import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { casePreviews } from './scripts/case-previews';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), casePreviews()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        portfolio: resolve(__dirname, 'index.html'),
        work: resolve(__dirname, 'work/index.html'),
      },
    },
  },
  server: { port: 5173, open: true },
});
