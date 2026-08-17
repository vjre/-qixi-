import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// GitHub Pages 地址：https://vjre.github.io/-qixi-/
export default defineConfig({
  base: '/-qixi-/',
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
});
