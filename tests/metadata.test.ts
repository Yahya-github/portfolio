import { describe, expect, it } from "vitest";
import { pageMetadata, rootMetadata } from "@/lib/metadata";

describe("rootMetadata", () => {
  it("sets the canonical origin", () => {
    expect(rootMetadata.metadataBase).toBeInstanceOf(URL);
    expect(String(rootMetadata.metadataBase)).toBe(
      "https://yahya-hallani.dev/",
    );
  });

  it("keeps the site out of search indexes until launch", () => {
    expect(rootMetadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("pageMetadata", () => {
  it("builds title, description and trailing-slash canonical", () => {
    expect(pageMetadata("achievements")).toEqual({
      title: "Achievements, Yahya Hallani",
      description:
        "A perfect score at the Canadian Computing Competition and first places at the DIRO Hackathon, the Intercollegiate Video Game Creation Competition and the Canadian Robotics Competition.",
      alternates: { canonical: "/achievements/" },
    });
  });

  it("uses the root canonical for the index", () => {
    expect(pageMetadata("index").alternates).toEqual({ canonical: "/" });
  });
});
