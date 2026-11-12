import type { AboutContent } from "./types";

export const about = {
  title: "Two passions",
  titleRows: ["TWO", "PASS", "IONS"],
  lead: "Strategy and automations",
  paragraph:
    "I am an absolute fan of Pokemon and Chess and a perfect mix of the two makes Pokemon Showdown. Competitive Pokemon for me is the perfect balance between bluff, strategy, fast calculations and complex combination of situations that makes every game an experience. My second passion is automation. I automated a daily morning debrief, lectures notes making, jobs search and I still have many more ideas that I'm excited to build to improve my day to day life. This passion stems directly from my most beloved game Minecraft and the automation modpacks that I love playing like SkyFactory 4 and StoneBlock 3.",
  paragraphLinks: [
    { text: "Pokemon Showdown", href: "https://pokemonshowdown.com" },
    { text: "Minecraft", href: "https://www.minecraft.net" },
  ],
  portraitAlt: "Yahya Hallani at DevFest Montreal 2026",
  portraitToggleSuffix: ", show in colour",
} as const satisfies AboutContent;
