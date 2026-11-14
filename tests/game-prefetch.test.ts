import { describe, expect, it, vi } from "vitest";
import {
  createPrefetch,
  heavyUrls,
  readSaveData,
} from "@/lib/proof/game/prefetch";

const PLAY = "/games/atlantis/68a6876b9a1e/play.html";

function okResponse(): Response {
  return new Response(new Uint8Array([1, 2, 3]));
}

describe("heavyUrls", () => {
  it("returns the wasm and pck next to the versioned play.html", () => {
    expect(heavyUrls(PLAY)).toEqual([
      "/games/atlantis/68a6876b9a1e/play.wasm",
      "/games/atlantis/68a6876b9a1e/play.pck",
    ]);
  });

  it("returns nothing for a path outside /games/", () => {
    expect(heavyUrls("https://evil.test/play.html")).toEqual([]);
    expect(heavyUrls("play.html")).toEqual([]);
  });
});

describe("createPrefetch", () => {
  it("does nothing until triggered", () => {
    const f = vi.fn();
    createPrefetch(PLAY, { fetch: f, saveData: false });
    expect(f).not.toHaveBeenCalled();
  });

  it("fetches both files at low priority once, however often triggered", () => {
    const f = vi.fn(async () => okResponse());
    const trigger = createPrefetch(PLAY, { fetch: f, saveData: false });
    trigger();
    trigger();
    trigger();
    expect(f).toHaveBeenCalledTimes(2);
    expect(f).toHaveBeenCalledWith(
      "/games/atlantis/68a6876b9a1e/play.wasm",
      expect.objectContaining({ priority: "low" }),
    );
  });

  it("never fetches when Save-Data is on", () => {
    const f = vi.fn();
    createPrefetch(PLAY, { fetch: f, saveData: true })();
    expect(f).not.toHaveBeenCalled();
  });

  it("swallows a failed fetch", async () => {
    const f = vi.fn(async () => {
      throw new Error("offline");
    });
    createPrefetch(PLAY, { fetch: f, saveData: false })();
    await Promise.resolve();
    expect(f).toHaveBeenCalledTimes(2);
  });
});

describe("readSaveData", () => {
  it("reads navigator.connection.saveData", () => {
    expect(readSaveData({ connection: { saveData: true } } as never)).toBe(
      true,
    );
    expect(readSaveData({ connection: { saveData: false } } as never)).toBe(
      false,
    );
    expect(readSaveData({} as never)).toBe(false);
  });
});
