// D-11: Lighthouse CI covers every route and stays pre-launch shaped until 07-08.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { facturo } from "../content/facturo";
import { sections } from "../content/site";

type Assertions = Record<string, unknown>;
type Rc = {
  ci: {
    collect: { url: string[]; settings: { ignoreStatusCode?: boolean } };
    assert: {
      assertMatrix: { matchingUrlPattern: string; assertions: Assertions }[];
    };
    upload: { target: string };
  };
};

const NOT_FOUND_ROUTE = "/this-page-does-not-exist/";
const ORIGIN = "http://localhost:4174";
const rc = JSON.parse(
  readFileSync(join(process.cwd(), "lighthouserc.json"), "utf8"),
) as Rc;
const [pageBlock, notFoundBlock] = rc.ci.assert.assertMatrix;

describe("lighthouserc.json", () => {
  it("audits every route plus the 404, in source order", () => {
    const routes = [
      ...sections.map((s) => s.route),
      facturo.route,
      NOT_FOUND_ROUTE,
    ];
    expect(rc.ci.collect.url).toEqual(routes.map((r) => `${ORIGIN}${r}`));
  });

  it("audits the 404 instead of aborting on its status code", () => {
    expect(rc.ci.collect.settings.ignoreStatusCode).toBe(true);
  });

  it("keeps page routes pre-launch shaped with the D-11 budgets", () => {
    const a = pageBlock.assertions;
    expect(a["categories:performance"]).toEqual(["error", { minScore: 0.95 }]);
    expect(a["categories:accessibility"]).toEqual(["error", { minScore: 1 }]);
    expect(a["categories:best-practices"]).toEqual([
      "error",
      { minScore: 0.95 },
    ]);
    expect(a["is-crawlable"]).toBe("off");
    expect(a).not.toHaveProperty("categories:seo");
  });

  it("skips the status and description audits on the 404 only", () => {
    const a = notFoundBlock.assertions;
    expect(a["http-status-code"]).toBe("off");
    expect(a["meta-description"]).toBe("off");
    expect(a["is-crawlable"]).toBe("off");
  });

  it("stores reports on the filesystem, never public storage", () => {
    expect(rc.ci.upload.target).toBe("filesystem");
  });
});
