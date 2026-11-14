// CONT-09 / D-11: only verified facts ship
import { describe, expect, it } from "vitest";
import { about } from "@/content/about";
import { achievements } from "@/content/achievements";
import { experience } from "@/content/experience";
import { facturo } from "@/content/facturo";
import { indexPage } from "@/content/index";
import { notFound } from "@/content/not-found";
import { projects } from "@/content/projects";
import { atlantis } from "@/content/atlantis";
import { robot } from "@/content/robot";
import { sayHi } from "@/content/say-hi";
import { sections, site } from "@/content/site";

const ALL_CONTENT = {
  site,
  sections,
  indexPage,
  achievements,
  projects,
  experience,
  about,
  sayHi,
  facturo,
  atlantis,
  robot,
  notFound,
};

const FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["a 'top 1' claim", /top 1/i],
  ["an em dash", /—/],
  ["a contest platform", /platform/i],
  ["a line count", /lines of code|\bLOC\b/i],
  ["a phone number", /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/],
];

const SAFE_HREF = /^(https:\/\/|mailto:|\/)/;

describe("fact guards", () => {
  for (const [name, content] of Object.entries(ALL_CONTENT)) {
    const text = JSON.stringify(content);
    for (const [label, pattern] of FORBIDDEN) {
      it(`${name} contains no ${label}`, () => {
        expect(text).not.toMatch(pattern);
      });
    }
  }
});

describe("experience dates", () => {
  it("shows a range, never 'since', for ended roles", () => {
    const ended = experience.work.filter((w) => w.ended);
    expect(ended.length).toBeGreaterThan(0);
    for (const row of ended) {
      expect(row.date).toMatch(/ to /);
      expect(row.date).not.toMatch(/since/i);
    }
  });

  it("starts every ongoing role with 'Since'", () => {
    for (const row of experience.work.filter((w) => !w.ended)) {
      expect(row.date.startsWith("Since")).toBe(true);
    }
  });

  it("lists five work rows, newest first", () => {
    expect(experience.work).toHaveLength(5);
    expect(experience.work[0].date).toBe("Since Nov 2026");
    expect(experience.work[0].organisation).toMatch(/^MAME/);
    expect(experience.work[4].date).toBe("Since 2025");
    expect(experience.work[4].role).toBe("Freelance developer");
  });
});

describe("achievements", () => {
  it("leads with the CCC perfect score", () => {
    expect(achievements.lines[0]).toMatchObject({
      rank: "75/75",
      result: "Canadian Computing Competition, perfect score",
      detail: "2026",
      href: null,
      accentRank: true,
    });
  });

  it("accents exactly one rank", () => {
    expect(achievements.lines.filter((l) => l.accentRank)).toHaveLength(1);
  });
});

describe("links", () => {
  const allHrefs: readonly (string | null)[] = [
    ...achievements.lines.map((l) => l.href),
    ...projects.rows.map((r) => r.link?.href ?? null),
    ...sayHi.lines.map((l) => l.href),
    sayHi.address.href,
  ];
  const hrefs = allHrefs.filter((h): h is string => h !== null);

  it("has links to check", () => {
    expect(hrefs.length).toBeGreaterThan(0);
  });

  it.each(hrefs)("%s uses https, mailto or a root path", (href) => {
    expect(href).toMatch(SAFE_HREF);
  });
});

describe("projects", () => {
  it("lists five rows, MAME first, numbered 02.2 to 02.6", () => {
    expect(projects.rows).toHaveLength(5);
    expect(projects.rows[0].name).toBe("MAME Tool Rental");
    expect(projects.rows.map((r) => r.number)).toEqual([
      "02.2",
      "02.3",
      "02.4",
      "02.5",
      "02.6",
    ]);
  });
});

describe("phase 6 content", () => {
  it("has exactly 10 walkthrough frames in order", () => {
    const names = projects.flagship.walkthrough.frames.map((f) => f.frame);
    expect(names).toEqual([
      "facturo-01-accueil",
      "facturo-02-historique",
      "facturo-03-nouvelle-facture",
      "facturo-04-paiements",
      "facturo-05-parametres",
      "facturo-06-palette",
      "facturo-07-accueil-sombre",
      "facturo-08-menu-reduit",
      "facturo-09-mobile",
      "facturo-10-clients",
    ]);
    expect(projects.flagship.imageAlt).toBe(
      projects.flagship.walkthrough.frames[0].alt,
    );
  });

  it("gives every achievement a preview, text only for 75/75", () => {
    for (const line of achievements.lines) {
      expect(line.preview).toBeDefined();
    }
    const text = achievements.lines.filter((l) => l.preview.kind === "text");
    expect(text.map((l) => l.rank)).toEqual(["75/75"]);
  });

  it("puts marks on exactly the 7 listed rows", () => {
    const marks = [
      ...experience.work.map((w) => w.mark),
      ...experience.involvement.map((i) => i.mark),
    ];
    expect(marks.filter((m) => m !== null)).toEqual([
      "mame",
      "mercor",
      "facturo",
      "crc",
      "mcgill-robotics",
      "gdg",
      "icpc",
    ]);
    expect(experience.work[4].mark).toBeNull();
  });

  it("has one copy line and it is the mailto", () => {
    const copying = sayHi.lines.filter((l) => l.copies);
    expect(copying).toHaveLength(1);
    expect(copying[0].href.startsWith("mailto:")).toBe(true);
  });

  it("keeps the Facturo deep dive complete and free of unverified claims", () => {
    expect(facturo.meta.every((m) => m.length > 0)).toBe(true);
    expect(facturo.sections.length).toBe(3);
    expect(facturo.links.items.length).toBeGreaterThan(0);
    const text = JSON.stringify(facturo);
    expect(text).not.toMatch(/in production/i);
    expect(text).not.toMatch(/users/i);
    for (const item of facturo.links.items) {
      expect(item.href).toMatch(SAFE_HREF);
    }
  });
});
