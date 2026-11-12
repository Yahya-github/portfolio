// D-08: the parsing and lazy-chunk rule behind `pnpm measure:js`.
import { describe, expect, it } from "vitest";
import {
  lazyChunks,
  moduleHint,
  referencedChunks,
  routeOf,
  scriptsOf,
} from "../scripts/lib/measure.mjs";

const HTML = `<html><head>
<link rel="preload" href="/_next/static/chunks/font.js" as="script"/>
<link rel="modulepreload" href="/_next/static/chunks/pre.js"/>
<link rel="stylesheet" href="/_next/static/chunks/a.css"/>
<script src="/_next/static/chunks/main.js" async=""></script>
<script src="/_next/static/chunks/main.js" async=""></script>
<script src="/_next/static/chunks/poly.js" noModule=""></script>
</head><body>
<script>self.__next_f.push([1,"1:I[\\"/_next/static/chunks/lazy.js\\"]"])</script>
</body></html>`;

describe("scriptsOf", () => {
  it("returns de-duplicated script srcs and preload links", () => {
    expect(scriptsOf(HTML)).toEqual([
      "/_next/static/chunks/main.js",
      "/_next/static/chunks/font.js",
      "/_next/static/chunks/pre.js",
    ]);
  });

  it("excludes noModule scripts and stylesheets", () => {
    const out = scriptsOf(HTML);
    expect(out).not.toContain("/_next/static/chunks/poly.js");
    expect(out.some((p) => p.endsWith(".css"))).toBe(false);
  });
});

describe("referencedChunks", () => {
  it("finds chunks in tags, noModule scripts and the inline payload", () => {
    const refs = referencedChunks(HTML);
    expect(refs).toContain("/_next/static/chunks/poly.js");
    expect(refs).toContain("/_next/static/chunks/lazy.js");
    expect(refs).toContain("/_next/static/chunks/main.js");
  });
});

describe("routeOf", () => {
  it("maps index.html paths to routes", () => {
    expect(routeOf("index.html")).toBe("/");
    expect(routeOf("about/index.html")).toBe("/about/");
    expect(routeOf("projects/facturo/index.html")).toBe("/projects/facturo/");
    expect(routeOf("projects\\facturo\\index.html")).toBe("/projects/facturo/");
  });
});

describe("lazyChunks", () => {
  it("keeps only chunks no page references", () => {
    expect(
      lazyChunks(
        ["/_next/static/chunks/a.js", "/_next/static/chunks/b.js"],
        new Set(["/_next/static/chunks/a.js"]),
      ),
    ).toEqual(["/_next/static/chunks/b.js"]);
  });
});

describe("moduleHint", () => {
  it("extracts the first project module id", () => {
    expect(
      moduleHint(
        '"[project]/lib/walkthrough/mount.ts [app-client] (ecmascript)"',
      ),
    ).toBe("lib/walkthrough/mount.ts");
  });

  it("falls back to unknown", () => {
    expect(moduleHint("no ids")).toBe("unknown");
  });
});
