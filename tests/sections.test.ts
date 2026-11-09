import { describe, expect, it } from "vitest";
import { sections } from "@/content/site";
import type { Slug } from "@/content/types";
import {
  counterLabel,
  headerLabel,
  indexOfSlug,
  letterSections,
  nextLink,
  sectionBySlug,
} from "@/lib/sections";

describe("indexOfSlug", () => {
  it("puts index first and say-hi last", () => {
    expect(indexOfSlug("index")).toBe(0);
    expect(indexOfSlug("say-hi")).toBe(5);
  });
});

describe("nextLink", () => {
  it("links index to achievements", () => {
    expect(nextLink("index")).toEqual({
      href: "/achievements/",
      label: "Next, Achievements",
    });
  });

  it("links about to say hi", () => {
    expect(nextLink("about")).toEqual({
      href: "/say-hi/",
      label: "Next, Say hi",
    });
  });

  it("wraps say hi back to the start", () => {
    expect(nextLink("say-hi")).toEqual({
      href: "/",
      label: "Back to the start",
    });
  });
});

describe("counterLabel", () => {
  it("formats the position against the last section", () => {
    expect(counterLabel("index")).toBe("00 / 05");
    expect(counterLabel("projects")).toBe("02 / 05");
    expect(counterLabel("say-hi")).toBe("05 / 05");
  });
});

describe("headerLabel", () => {
  it("uses the index label on the index", () => {
    expect(headerLabel("index")).toBe("Index");
  });

  it("joins number and name elsewhere", () => {
    expect(headerLabel("experience")).toBe("03 Experience");
  });
});

describe("letterSections", () => {
  it("returns the five lettered sections spelling YAHYA", () => {
    const lettered = letterSections();
    expect(lettered).toHaveLength(5);
    expect(lettered.map((s) => s.letter).join("")).toBe("YAHYA");
    expect(lettered.map((s) => s.route)).toEqual([
      "/achievements/",
      "/projects/",
      "/experience/",
      "/about/",
      "/say-hi/",
    ]);
  });
});

describe("sectionBySlug", () => {
  it("throws on an unknown slug", () => {
    expect(() => sectionBySlug("x" as Slug)).toThrow("unknown section: x");
  });
});

describe("routes", () => {
  it("use a trailing slash everywhere except the root", () => {
    const nested = sections.filter((s) => s.route !== "/");
    expect(nested).toHaveLength(5);
    for (const s of nested) {
      expect(s.route.startsWith("/")).toBe(true);
      expect(s.route.endsWith("/")).toBe(true);
    }
  });
});
