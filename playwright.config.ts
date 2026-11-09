import { defineConfig, devices } from "@playwright/test";

// Set BASE_URL (e.g. https://yahya-hallani.dev) for a manual live check; otherwise the built out/ is served locally.
const liveBaseUrl = process.env.BASE_URL;

// NAV-01: wheel/key differences across engines; host has Chromium only, CI's Playwright container has all three (RESEARCH Environment).
const PAGER_CROSS = /pager-(wheel|keys|history)\.spec\.ts/;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: liveBaseUrl ?? "http://localhost:4173",
    trace: "retain-on-failure",
  },
  webServer: liveBaseUrl
    ? undefined
    : {
        command: "pnpm exec serve out -l 4173 --no-clipboard",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/visual\.spec\.ts/, /pager-swipe\.spec\.ts/],
    },
    // A11Y-05: the same routes with JavaScript off.
    {
      name: "chromium-nojs",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
      testMatch: /routes\.spec\.ts/,
    },
    // NAV-03: touch swipe on a phone-sized viewport.
    {
      name: "chromium-touch",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
      },
      testMatch: /pager-swipe\.spec\.ts/,
    },
    ...(process.env.ALL_BROWSERS === "1"
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
            testMatch: PAGER_CROSS,
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
            testMatch: PAGER_CROSS,
          },
        ]
      : []),
    // DSGN-01/02/06: screenshot baselines, only inside the pinned Playwright container (Pitfall 6).
    ...(process.env.VISUAL === "1"
      ? [
          {
            name: "visual",
            use: { ...devices["Desktop Chrome"] },
            testMatch: /visual\.spec\.ts/,
          },
        ]
      : []),
  ],
});
