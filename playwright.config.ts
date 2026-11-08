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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
