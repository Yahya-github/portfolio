// D-08: the parsing and lazy-chunk rule behind `pnpm measure:js`.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  gameFiles,
  lazyChunks,
  modelFiles,
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

describe("routeOf and game pages", () => {
  it("never yields a route for a game page", () => {
    expect(routeOf("games/atlantis/x/play.html")).toBeNull();
    expect(routeOf("games/atlantis/x/index.html")).toBeNull();
  });
});

describe("modelFiles / gameFiles", () => {
  const paths = [
    "index.html",
    "models/robot/abc123/robot.bin",
    "models/robot/abc123/other.bin",
    "games/atlantis/x/play.html",
    "games/atlantis/x/game.wasm",
  ];

  it("keeps only robot.bin under models/", () => {
    expect(modelFiles(paths)).toEqual(["models/robot/abc123/robot.bin"]);
  });

  it("keeps everything under games/", () => {
    expect(gameFiles(paths)).toEqual([
      "games/atlantis/x/play.html",
      "games/atlantis/x/game.wasm",
    ]);
  });
});

describe("measure-js --max-model-kb", () => {
  const run = (withModel: boolean) => {
    const dir = mkdtempSync(join(tmpdir(), "measure-"));
    try {
      mkdirSync(join(dir, "_next/static/chunks"), { recursive: true });
      writeFileSync(join(dir, "index.html"), "<html></html>");
      if (withModel) {
        mkdirSync(join(dir, "models/robot/abc"), { recursive: true });
        writeFileSync(
          join(dir, "models/robot/abc/robot.bin"),
          new Uint8Array(2048),
        );
      }
      return spawnSync(
        process.execPath,
        ["scripts/measure-js.mjs", dir, "--max-model-kb", "1"],
        { encoding: "utf8" },
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it("fails and names an oversized model", () => {
    const res = run(true);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("robot.bin");
  });

  it("reports no model and passes when none exists", () => {
    const res = run(false);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("no model");
  });
});
