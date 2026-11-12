import type { NotFoundContent } from "./types";

/** 404 strings (SEO-02, D-08). Links, nav label and back link reuse site and sections. */
export const notFound = {
  display: "404",
  headingRest: "Page not found",
  line: "That page doesn't exist. Pick a section below.",
  headerLabel: "Not found",
  metaTitle: "Page not found, Yahya Hallani",
} as const satisfies NotFoundContent;
