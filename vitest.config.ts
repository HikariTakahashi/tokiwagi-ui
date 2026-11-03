import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // V8の精密カバレッジ収集によるChromiumのメモリ増加を避ける。
    coverage: { provider: 'istanbul' },
    projects: [{
      plugins: [storybookTest({
        configDir: fileURLToPath(new URL('./.storybook', import.meta.url)),
        storybookScript: 'bun run storybook --ci',
        storybookUrl: 'http://127.0.0.1:6006',
      })],
      test: {
        name: 'storybook',
        // Storybook・エディターと併用するDev Containerでもブラウザを直列実行する。
        maxWorkers: 1,
        browser: {
          enabled: true,
          provider: playwright({
            // Linuxの全件実行で破棄済みiframeの回収を促し、ブラウザ切断を防ぐ。
            launchOptions: process.platform === 'linux'
              ? { args: ['--js-flags=--max-old-space-size=256'] }
              : {},
          }),
          headless: true,
          instances: [{ browser: 'chromium' }],
        },
      },
    }],
  },
});
