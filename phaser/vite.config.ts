import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    headers: { 'Cache-Control': 'no-cache' },
  },
  preview: {
    headers: { 'Cache-Control': 'no-cache' },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
});
