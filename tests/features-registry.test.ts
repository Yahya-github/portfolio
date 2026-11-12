import { describe, expect, it } from "vitest";
import {
  FEATURE_LOADERS,
  GLOBAL_FEATURES,
  PAGE_FEATURES,
  featureJobs,
  neighbourSlugs,
} from "@/lib/features/registry";

describe("GLOBAL_FEATURES", () => {
  it("mounts the motion module once, and it has a loader", () => {
    expect(GLOBAL_FEATURES).toEqual(["motion"]);
    expect(FEATURE_LOADERS.motion).toBeTypeOf("function");
  });
});

describe("neighbourSlugs", () => {
  it("clamps at the first page", () => {
    expect(neighbourSlugs(0)).toEqual(["index", "achievements"]);
  });
  it("returns three slugs in the middle", () => {
    expect(neighbourSlugs(2)).toEqual([
      "achievements",
      "projects",
      "experience",
    ]);
  });
  it("clamps at the last page", () => {
    expect(neighbourSlugs(5)).toEqual(["about", "say-hi"]);
  });
});

describe("featureJobs", () => {
  it("lists neighbour jobs in slug then feature order", () => {
    expect(featureJobs(2, new Set()).map((j) => j.id)).toEqual([
      "previews:achievements",
      "walkthrough:projects",
      "previews:projects",
      "toggles:projects",
      "toggles:experience",
    ]);
  });
  it("omits loaded jobs", () => {
    const ids = featureJobs(2, new Set(["walkthrough:projects"])).map(
      (j) => j.id,
    );
    expect(ids).not.toContain("walkthrough:projects");
  });
  it("returns only previews for the first page", () => {
    expect(featureJobs(0, new Set()).map((j) => j.id)).toEqual([
      "previews:achievements",
    ]);
  });
  it("never returns a key missing from FEATURE_LOADERS", () => {
    for (let t = 0; t < Object.keys(PAGE_FEATURES).length; t++) {
      for (const job of featureJobs(t, new Set())) {
        expect(FEATURE_LOADERS[job.key]).toBeTypeOf("function");
      }
    }
  });
});
