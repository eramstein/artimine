import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  base: command === 'serve' ? '/' : '/artimine/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Only exclude tools folder during build, not during development
        if (command === 'build') {
          return id.includes('/tools/') || id.includes('\\tools\\');
        }
        return false;
      },
    },
  },
}));
