import { defineConfig } from '@playwright/test';

const preview = 'npm run preview -- --host 127.0.0.1 --port 4175 --strictPort';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  // Allow for software-rendered 3D and accessibility scans on CI runners.
  timeout: 180_000,
  expect: { timeout: 20_000 },
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4175',
    contextOptions: { reducedMotion: 'reduce', timezoneId: 'America/New_York' },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: process.env.PORTFOLIO_BUILD_READY === '1' ? preview : `npm run build && ${preview}`,
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
