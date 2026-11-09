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
    },
    {
      rank: "1st",
      result: "DIRO Hackathon, Université de Montréal",
      detail: "1st of 18 teams from 9 CEGEPs, $2,500 team scholarship, 2026",
      href: "https://diro.umontreal.ca/departement/nouvelles/nouvelle/news/detail/News/une-participation-remarquable-au-hackathon-2026-du-diro/",
      accentRank: false,
    },
    {
      rank: "1st",
      result: "Intercollegiate Video Game Creation Competition",
      detail: "With Atlantis, a 2D game in Godot 4, 2026",
      href: "https://www.neomedia.com/vaudreuil-soulanges/actualites/education/657299/l-intercollegial-de-creation-de-jeux-video-au-cegep-de-valleyfield",
      accentRank: false,
    },
    {
      rank: "1st",
      result: "Canadian Robotics Competition, robot competition",
      detail: "Matches against the other teams' robots, 2026",
      href: "https://www.instagram.com/p/DYPS2bGOAQy/",
      accentRank: false,
    },
    {
      rank: "1st, 2nd",
      result: "Canadian Robotics Competition, programming",
      detail: "1st in Programming in 2025, 2nd in Senior Programming in 2026",
      href: "https://www.instagram.com/p/DWmZr18kTA3/",
      accentRank: false,
    },
  ],
} as const satisfies AchievementsContent;
