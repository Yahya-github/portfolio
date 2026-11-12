import type { ExperienceContent } from "./types";

export const experience = {
  title: "Experience",
  workHead: "Work",
  involvementHead: "Involvement",
  work: [
    {
      date: "Since Nov 2026",
      role: "Developer",
      organisation:
        "MAME Tool Rental, McGill Association of Mechanical Engineers",
      ended: false,
      mark: "mame",
    },
    {
      date: "Since Sep 2026",
      role: "Coding agent evaluator",
      organisation: "Mercor, contractor",
      ended: false,
      mark: "mercor",
    },
    {
      date: "Jun 2026 to Oct 2026",
      role: "Developer",
      organisation: "Facturo, for a Quebec trucking company",
      ended: true,
      mark: "facturo",
    },
    {
      date: "Since Feb 2026",
      role: "Problem author",
      organisation: "CRC 2027, volunteer",
      ended: false,
      mark: "crc",
    },
    {
      date: "Since 2025",
      role: "Freelance developer",
      organisation: "12 projects for 9 clients",
      ended: false,
      mark: null,
    },
  ],
  involvement: [
    {
      role: "Software",
      organisation: "McGill Robotics",
      mark: "mcgill-robotics",
    },
    {
      role: "Full-stack",
      organisation: "Google Developer Group at McGill, subteam project",
      mark: "gdg",
    },
    {
      role: "Competitor",
      organisation: "McGill Compete, ICPC NENA",
      mark: "icpc",
    },
  ],
} as const satisfies ExperienceContent;
