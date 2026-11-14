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
    deepDive: { label: "Read the deep dive", href: "/projects/facturo/" },
    walkthrough: {
      roleDescription: "walkthrough",
      groupLabel: "Facturo screens",
      frames: [
        {
          frame: "facturo-01-accueil",
          name: "Home",
          alt: "Facturo home screen: the dashboard of the Demo Transport Inc. workspace, with fictional clients and invoices",
        },
        {
          frame: "facturo-02-historique",
          name: "History",
          alt: "Facturo invoice history, fictional data",
        },
        {
          frame: "facturo-03-nouvelle-facture",
          name: "New invoice",
          alt: "Facturo new invoice form, fictional data",
        },
        {
          frame: "facturo-04-paiements",
          name: "Payments",
          alt: "Facturo payments screen, fictional data",
        },
        {
          frame: "facturo-05-parametres",
          name: "Settings",
          alt: "Facturo settings screen",
        },
        {
          frame: "facturo-06-palette",
          name: "Command palette",
          alt: "Facturo command palette",
        },
        {
          frame: "facturo-07-accueil-sombre",
          name: "Home, dark theme",
          alt: "Facturo home screen in the dark theme, fictional data",
        },
        {
          frame: "facturo-08-menu-reduit",
          name: "Collapsed sidebar",
          alt: "Facturo with the sidebar collapsed, fictional data",
        },
        {
          frame: "facturo-09-mobile",
          name: "Phone",
          alt: "Facturo on a 390px phone screen, fictional data",
        },
        {
          frame: "facturo-10-clients",
          name: "Clients",
          alt: "Facturo client list, fictional clients",
        },
      ],
      controls: {
        pause: "Pause",
        pauseName: "Pause walkthrough",
        play: "Play",
        playName: "Play walkthrough",
        previous: "Previous",
        previousName: "Previous screen",
        next: "Next",
        nextName: "Next screen",
      },
      counterTemplate: "{nn} / 10, {name}",
      statusTemplate: "{nn} of 10, {name}",
    },
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
      mark: "mame",
      preview: {
        image: "mame-05-admin-overview",
        alt: "MAME Tool Rental admin overview with request counts, rentals per week and the most-rented tools, demo data",
        caption: [
          "Admin overview, demo data",
          "McGill Association of Mechanical Engineers",
        ],
      },
      linkCursorTag: "Live site",
      dive: null,
      diveCursorTag: null,
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
      mark: null,
      preview: null,
      linkCursorTag: null,
      dive: { label: "Play", href: "/projects/atlantis/" },
      diveCursorTag: "Play Atlantis",
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
      mark: null,
      preview: null,
      linkCursorTag: null,
      dive: null,
      diveCursorTag: null,
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
      mark: null,
      preview: null,
      linkCursorTag: null,
      dive: { label: "3D model", href: "/projects/robot/" },
      diveCursorTag: "Rotate the robot",
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
      mark: null,
      preview: null,
      linkCursorTag: null,
      dive: null,
      diveCursorTag: null,
    },
  ],
} as const satisfies ProjectsContent;
