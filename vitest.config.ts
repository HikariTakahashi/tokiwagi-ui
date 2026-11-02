import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [{
      plugins: [storybookTest({
        configDir: fileURLToPath(new URL('./.storybook', import.meta.url)),
        storybookScript: 'bun run storybook --ci',
        storybookUrl: 'http://127.0.0.1:6006',
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          provider: playwright(),
          headless: true,
          instances: [{ browser: 'chromium' }],
        },
      },
    }],
  },
});
