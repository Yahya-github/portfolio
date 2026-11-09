import type { ProjectsContent } from "./types";

export const projects = {
  title: "Projects",
  flagship: {
    name: "Facturo",
    lines: [
      "Paper tickets from a Quebec trucking company, turned into tax-correct invoices.",
      "Local-first app with more than 700 tests and verified in-app updates. Public demo with fictional data.",
    ],
    imageAlt:
      "Facturo home screen: the dashboard of the Demo Transport Inc. workspace, with fictional clients and invoices",
  },
  rows: [
    {
      number: "02.2",
      name: "MAME Tool Rental",
      link: {
        label: "Live site",
        href: "https://mame-tool-rental.vercel.app/",
      },
      lines: [
        "Tool and machine rental with an admin dashboard",
        "FastAPI and Next.js, deployed only after every test passes",
        "Built for MAME, in use at MAME",
      ],
    },
    {
      number: "02.3",
      name: "Atlantis",
      link: { label: "Code", href: "https://github.com/Yahya-github/atlantis" },
      lines: [
        "A 2D game in Godot 4, built with a team",
        "Architected 6 gameplay systems",
        "1st place, Intercollegiate Video Game Creation Competition 2026",
      ],
    },
    {
      number: "02.4",
      name: "CRC problems",
      link: null,
      lines: [
        "12 algorithmic problems for CRC 2027",
        "Author, volunteer since February 2026",
        "Reference solutions and 20+ edge-case tests each, in C++ and Python",
      ],
    },
    {
      number: "02.5",
      name: "Robot firmware",
      link: {
        label: "Team site",
        href: "https://agisback.crcrobotics.com/fr/",
      },
      lines: [
        "Firmware for the CRC 2026 robot",
        "Embedded state machine in C/C++, PID tuning",
        "1st place, robot competition, 2026",
      ],
    },
    {
      number: "02.6",
      name: "Showdown AI",
      link: null,
      lines: [
        "A competitive battle agent",
        "An agent that plays ranked Pokémon Showdown battles",
        "In progress, nothing built yet",
      ],
    },
  ],
} as const satisfies ProjectsContent;
