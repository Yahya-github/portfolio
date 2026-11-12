// CONT-07: Say hi offers four ways to reach me; Email copies the address (RESEARCH Pattern 6, Pitfall 8).
import { expect, test, type Page } from "@playwright/test";
import { sayHi } from "../content/say-hi";
import { site } from "../content/site";

const ADDRESS = site.contact.email;
const ROOT = "#page-say-hi";
const EMAIL = `${ROOT} a[data-copy-email]`;
const STATUS = `${ROOT} [data-copy-status]`;
const ADDR_LINK = `${ROOT} [data-copy-line] a`;
const COPIED = sayHi.copy.copied.replace("{address}", ADDRESS);
const FAILED = sayHi.copy.failed.replace("{address}", ADDRESS);

declare global {
  interface Window {
    __writes: string[];
    __defaultPrevented: boolean[];
  }
}

test.use({ viewport: { width: 1440, height: 900 } });

/** The copy-email feature is lazy: its aria-describedby marks it as mounted. */
async function openReady(page: Page) {
  await page.goto("/say-hi/");
  await expect(page.locator(EMAIL)).toHaveAttribute(
    "aria-describedby",
    "copy-email-description",
  );
}

async function spyOnWriteText(page: Page) {
  await page.addInitScript(() => {
    window.__writes = [];
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: (text: string) => {
          window.__writes.push(text);
          return Promise.resolve();
        },
      },
      configurable: true,
    });
  });
}

test("four ways to reach me", async ({ page }) => {
  await page.goto("/say-hi/");
  const lines = page.locator(`${ROOT} a.t-display`);
  await expect(lines).toHaveText([
    "Email",
    "LinkedIn",
    "GitHub",
    "Resume (PDF)",
  ]);
  await expect(lines.nth(0)).toHaveAttribute("href", `mailto:${ADDRESS}`);
  await expect(lines.nth(1)).toHaveAttribute("href", site.contact.linkedin);
  await expect(lines.nth(2)).toHaveAttribute("href", site.contact.github);
  await expect(lines.nth(3)).toHaveAttribute("href", site.resume.href);
  for (const i of [1, 2]) {
    await expect(lines.nth(i)).toHaveAttribute("target", "_blank");
    await expect(lines.nth(i)).toHaveAttribute("rel", "noopener noreferrer");
  }
});

test("Email copies the address", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openReady(page);
  await page.click(EMAIL);
  await expect(page.locator(STATUS)).toHaveText(COPIED);
  await expect(page.locator(ADDR_LINK)).toBeHidden();
  // Assumption A5: the real clipboard is readable in headless Chromium with the permission granted.
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toBe(ADDRESS);
  await expect(page.locator(STATUS)).toHaveText("", { timeout: 6000 });
  await expect(page.locator(ADDR_LINK)).toBeVisible();
});

test("a blocked clipboard shows the fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () =>
          Promise.reject(new DOMException("blocked", "NotAllowedError")),
      },
      configurable: true,
    });
  });
  await openReady(page);
  await page.click(EMAIL);
  await expect(page.locator(STATUS)).toHaveText(FAILED);
  await expect(page.locator(ADDR_LINK)).toBeVisible();
  await expect(page.locator(ADDR_LINK)).toHaveAttribute(
    "href",
    `mailto:${ADDRESS}`,
  );
});

test("modifier click keeps native behaviour", async ({ page }) => {
  await spyOnWriteText(page);
  await openReady(page);
  await page.evaluate(() => {
    window.__defaultPrevented = [];
    document.addEventListener("click", (e) => {
      window.__defaultPrevented.push(e.defaultPrevented);
      // Keep the test page in place: stop the native mailto navigation after recording.
      e.preventDefault();
    });
  });
  await page.click(EMAIL, { modifiers: ["Control"] });
  expect(await page.evaluate(() => window.__defaultPrevented)).toEqual([false]);
  expect(await page.evaluate(() => window.__writes)).toEqual([]);
});

test.describe("JS off", () => {
  test.use({ javaScriptEnabled: false });

  test("Email stays a plain mailto link", async ({ page }) => {
    await page.goto("/say-hi/");
    const email = page.locator(EMAIL);
    await expect(email).toHaveAttribute("href", /^mailto:/);
    await expect(page.locator(STATUS)).toHaveText("");
    await expect(email).not.toHaveAttribute("aria-describedby", /.*/);
  });
});
