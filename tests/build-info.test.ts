import { describe, expect, it } from "vitest";
import { shortSha } from "@/lib/build-info";

describe("shortSha", () => {
  it("returns the first 7 characters of a full 40-char SHA", () => {
    expect(shortSha("0123456789abcdef0123456789abcdef01234567")).toBe("0123456");
  });

  it("returns 'local' when the SHA is undefined", () => {
    expect(shortSha(undefined)).toBe("local");
  });

  it("returns 'local' when the SHA is empty", () => {
    expect(shortSha("")).toBe("local");
  });

  it("returns 'local' for non-hex input", () => {
    expect(shortSha("not-a-sha!")).toBe("local");
  });

  it("lower-cases an upper-case SHA", () => {
    expect(shortSha("ABCDEF1234")).toBe("abcdef1");
  });
});
