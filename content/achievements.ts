import type { AchievementsContent } from "./types";

export const achievements = {
  title: "Achievements",
  titleRows: ["AC", "HI", "EV", "EM", "EN", "TS"],
  lines: [
    {
      rank: "75/75",
      result: "Canadian Computing Competition, perfect score",
      detail: "2026",
      href: null,
      accentRank: true,
      preview: {
        kind: "text",
        caption: ["75 of 75 points", "Canadian Computing Competition 2026"],
      },
      cursorTag: null,
    },
    {
      rank: "1st",
      result: "DIRO Hackathon, Université de Montréal",
      detail: "1st of 18 teams from 9 CEGEPs, $2,500 team scholarship, 2026",
      href: "https://diro.umontreal.ca/departement/nouvelles/nouvelle/news/detail/News/une-participation-remarquable-au-hackathon-2026-du-diro/",
      accentRank: false,
      preview: {
        kind: "photo",
        photo: "diro-hackathon-2026-award",
        alt: "The winning team with their certificates at the DIRO Hackathon 2026",
        caption: [
          "The winners with their certificates",
          "Article, diro.umontreal.ca",
        ],
      },
      cursorTag: "Read the article",
    },
    {
      rank: "1st",
      result: "Intercollegiate Video Game Creation Competition",
      detail: "With Atlantis, a 2D game in Godot 4, 2026",
      href: "https://www.neomedia.com/vaudreuil-soulanges/actualites/education/657299/l-intercollegial-de-creation-de-jeux-video-au-cegep-de-valleyfield",
      accentRank: false,
      preview: {
        kind: "photo",
        photo: "game-competition-2026-team",
        alt: "The Atlantis team at the intercollegiate competition, Cégep de Valleyfield",
        caption: [
          "The Atlantis team at Cégep de Valleyfield",
          "Article, neomedia.com",
        ],
      },
      cursorTag: "Read the article",
    },
    {
      rank: "1st",
      result: "Canadian Robotics Competition, robot competition",
      detail: "Matches against the other teams' robots, 2026",
      href: "https://www.instagram.com/p/DYPS2bGOAQy/",
      accentRank: false,
      preview: {
        kind: "photo",
        photo: "club-of-the-year-award",
        alt: "The team on stage with its school's Club of the Year award",
        caption: ["Our school's Club of the Year", "Post, instagram.com"],
      },
      cursorTag: "See the post",
    },
    {
      rank: "1st, 2nd",
      result: "Canadian Robotics Competition, programming",
      detail: "1st in Programming in 2025, 2nd in Senior Programming in 2026",
      href: "https://www.instagram.com/p/DWmZr18kTA3/",
      accentRank: false,
      preview: {
        kind: "photo",
        photo: "crc-2026-trophies",
        alt: "The team with its CRC 2026 trophies",
        caption: ["The team with its 2026 trophies", "Post, instagram.com"],
      },
      cursorTag: "See the post",
    },
  ],
} as const satisfies AchievementsContent;
