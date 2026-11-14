import { achievements } from "./achievements";
import { atlantisBuild } from "./generated/atlantis-build";
import type { AtlantisContent, DeepDiveLink } from "./types";

/** Licence notices ship inside the versioned export folder (plan 08-15). */
const creditsLink: readonly DeepDiveLink[] = atlantisBuild
  ? [
      {
        label: "Credits",
        href: atlantisBuild.path.replace(/play\.html$/, "LICENSES.txt"),
        source: "Licences for the art, font and addons",
        external: false,
      },
    ]
  : [];

const teamPhotoAlt = ((): string => {
  for (const line of achievements.lines) {
    const p = line.preview;
    if (p.kind === "photo" && p.photo === "game-competition-2026-team") {
      return p.alt;
    }
  }
  throw new Error("Atlantis team photo missing from achievements");
})();

export const atlantis = {
  route: "/projects/atlantis/",
  project: "atlantis",
  title: "Atlantis",
  titleWords: ["Atlantis"],
  headerLabel: "02.3 Atlantis",
  metaTitle: "Atlantis, Yahya Hallani",
  metaDescription:
    "Atlantis, a 2D game in Godot 4 built with a team, 1st place at the Intercollegiate Video Game Creation Competition 2026. Play it in the browser.",
  metaDescriptionFallback:
    "Atlantis, a 2D game in Godot 4 built with a team, 1st place at the Intercollegiate Video Game Creation Competition 2026.",
  lines: [
    "A 2D game in Godot 4, built with a team.",
    "I architected 6 gameplay systems, and rebuilt save and inventory in the last 4 hours after a state-corruption bug.",
    "1st place, Intercollegiate Video Game Creation Competition 2026.",
  ],
  meta: ["Jan 2026", "Godot 4, team project", "In French"],
  poster: {
    key: "atlantis/atlantis-01",
    alt: "Atlantis gameplay, the title menu on a brushed-metal bulkhead with a porthole onto ruins, the ATLANTIS plate and the JOUER, TOUCHES and QUITTER buttons",
    caption: null,
  },
  gallery: [
    {
      key: "atlantis/atlantis-02",
      alt: "Atlantis gameplay, level 1 with the submarine at the centre of a rocky cave, a pressure gauge, an oxygen gauge and an inventory hint",
      caption: null,
    },
    {
      key: "atlantis/atlantis-03",
      alt: "Atlantis gameplay, the same level with the inventory panel open and four empty collectible slots",
      caption: null,
    },
    {
      key: "achievements/game-competition-2026-team",
      alt: teamPhotoAlt,
      caption:
        "The team at the Intercollegiate Video Game Creation Competition 2026",
    },
  ],
  links: [
    {
      label: "Code",
      href: "https://github.com/Yahya-github/atlantis",
      source: "GitHub, fork of plastikup/atlantis",
      external: true,
    },
    {
      label: "Article",
      href: "https://www.neomedia.com/vaudreuil-soulanges/actualites/education/657299/l-intercollegial-de-creation-de-jeux-video-au-cegep-de-valleyfield",
      source: "Article, neomedia.com",
      external: true,
    },
    ...creditsLink,
  ],
  backLabel: "Back to Projects",
  game: {
    play: "Play Atlantis",
    sizeLine: "Loads {size} MB of game files",
    loading: "Loading the game",
    loadingPct: "Loading the game, {nn}%",
    running: "Atlantis is running. Press Escape to leave the game.",
    exit: "Exit game",
    mute: "Mute",
    unmute: "Unmute",
    muteName: "Mute game sound",
    unmuteName: "Unmute game sound",
    escHint: "Esc leaves the game",
    touchFallback:
      "Best on desktop. Atlantis is played with a keyboard and mouse.",
    noscript: "Playing needs JavaScript. The screenshots and code are here.",
    loadError: "The game didn't load. Try again, or read the code on GitHub.",
    retry: "Try again",
    cannotRun:
      "This browser can't run the game. The screenshots and code are below.",
    frameTitle: "Atlantis game",
    posterCursorTag: "Play",
  },
  credits: [
    "Some art from Freepik.",
    "Music: Mermaids in Town, original track by the team.",
    "Font: Black Ops One (SIL Open Font License).",
    "Addons: Dialogic and Controller Icons (MIT).",
  ],
} as const satisfies AtlantisContent;
