import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  // VS Codeのポート転送先と揃え、localhostがIPv6だけに解決される環境でも接続できるようにする。
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
});
