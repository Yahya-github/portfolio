import { defineConfig, devices } from "@playwright/test";

// Set BASE_URL (e.g. https://yahya-hallani.dev) for a manual live check; otherwise the built out/ is served locally.
const liveBaseUrl = process.env.BASE_URL;

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
  // Firefox and WebKit projects arrive in Phase 4 (wheel/trackpad differences).
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /visual\.spec\.ts/,
    },
    // A11Y-05: the same routes with JavaScript off.
    {
      name: "chromium-nojs",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
      testMatch: /routes\.spec\.ts/,
    },
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
