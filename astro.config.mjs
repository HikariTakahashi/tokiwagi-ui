import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  server: { host: 'localhost', port: 4321 },
  devToolbar: { enabled: false },
});
