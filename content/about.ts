import type { AboutContent } from "./types";

export const about = {
  title: "Two habits",
  titleRows: ["TWO", "HAB", "ITS"],
  lead: "I decide fast under pressure, and I build things that run themselves.",
  paragraph:
    "The first came from competitive Pokémon, which is like chess with more variables: bluffing, and working out damage fast on a clock. The second came from Minecraft automation packs like SkyFactory and StoneBlock, where the goal is a machine that keeps working without you.",
  portraitAlt: "Yahya Hallani at DevFest Montreal 2026",
  portraitToggleSuffix: ", show in colour",
} as const satisfies AboutContent;
