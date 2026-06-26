import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.TEST_SUITE === "e2e" ? 2 : 0,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // The site under test exposes test hooks via data-qa, not data-testid -
    // this makes getByTestId() match its actual markup.
    testIdAttribute: 'data-qa',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // webServer: {
  //   command: 'npm run dev:app',
  //   url: process.env.BASE_URL,
  //   reuseExistingServer: !process.env.CI,
  // },
});
