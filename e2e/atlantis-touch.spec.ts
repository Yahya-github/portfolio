// PROOF-01 / D-09: a touch-only device gets the fallback line and no Play.
import { test, expect } from "@playwright/test";
import { atlantis } from "../content/atlantis";

const ROUTE = "/projects/atlantis/";

test("touch device: fallback line, no Play, no game request", async ({
  page,
}) => {
  const games: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/games/")) games.push(r.url());
  });
  await page.goto(ROUTE);
  await expect(page.locator("[data-game-line]")).toHaveText(
    atlantis.game.touchFallback,
  );
  await expect(
    page.getByRole("button", { name: atlantis.game.play }),
  ).toBeHidden();
  await page.locator("[data-game-slot]").tap();
  await page.waitForTimeout(500);
  expect(games).toEqual([]);
});
