import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Bun Testの*.test.ts・*.spec.tsと分けて、既存テストへの混入を防ぐ。
  testMatch: '**/*.visual.ts',
  snapshotDir: './.visual-baselines',
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/report.json' }]],
  outputDir: 'test-results',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixels: 0,
      threshold: 0,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:6006',
    viewport: { width: 800, height: 600 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'bun run build:storybook && bunx --no-install http-server storybook-static -a 127.0.0.1 -p 6006 -c-1',
    url: 'http://127.0.0.1:6006/iframe.html',
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
