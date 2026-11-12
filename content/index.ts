import type { IndexContent } from "./types";

export const indexPage = {
  title: "Yahya Hallani",
  metaLabels: ["Software engineering", "McGill University", "Montréal, Québec"],
  landscapeHint: "Landscape shows the full posters",
} as const satisfies IndexContent;
