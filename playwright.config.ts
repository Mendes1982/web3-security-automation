import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Web3 Security Automation - Playwright Configuration
 * 
 * This configuration is optimized for testing Web3 DApps with MetaMask integration.
 * Supports multiple browsers, parallel execution, and network-specific testing.
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Maximum time one test can run for
  timeout: 120 * 1000, // 2 minutes (Web3 transactions can be slow)

  // Maximum time for expect() assertions
  expect: {
    timeout: 30 * 1000, // 30 seconds
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 1,

  // Opt out of parallel tests on CI for stability
  workers: process.env.CI ? 2 : undefined,

  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['junit', { outputFile: 'test-results/junit.xml' }]] : []),
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for all tests
    baseURL: process.env.APP_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on first retry
    video: 'on-first-retry',

    // Action timeout
    actionTimeout: 30 * 1000,

    // Navigation timeout
    navigationTimeout: 60 * 1000,

    // Viewport size
    viewport: { width: 1920, height: 1080 },

    // Headless mode (false for headed mode)
    headless: process.env.HEADED !== 'true',

    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome arguments for MetaMask extension support
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox-specific settings
        launchOptions: {
          firefoxUserPrefs: {
            'dom.disable_beforeunload': false,
          },
        },
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile viewport tests
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*mobile\.spec\.ts/,
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*mobile\.spec\.ts/,
    },

    // Smoke tests - critical path only
    {
      name: 'smoke',
      grep: /@smoke/,
      retries: 0,
    },

    // Security tests - run in serial mode
    {
      name: 'security',
      testMatch: /tests\/security\/*.spec.ts/,
      fullyParallel: false,
      workers: 1,
    },

    // Performance tests - longer timeout
    {
      name: 'performance',
      testMatch: /tests\/performance\/*.spec.ts/,
      timeout: 300 * 1000, // 5 minutes
    },
  ],

  // Run local dev server before starting the tests
  webServer: process.env.CI
    ? [
        {
          command: 'npm run node:start',
          url: 'http://127.0.0.1:8545',
          timeout: 120 * 1000,
          reuseExistingServer: !process.env.CI,
          name: 'Local Blockchain',
        },
        {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          timeout: 120 * 1000,
          reuseExistingServer: !process.env.CI,
          name: 'DApp Server',
        },
      ]
    : undefined,

  // Global setup and teardown
  globalSetup: require.resolve('./fixtures/global-setup'),
  globalTeardown: require.resolve('./fixtures/global-teardown'),

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Preserve test output on failure
  preserveOutput: 'failures-only',
});
