import type { Section, Site } from "./types";

export const site = {
  origin: "https://yahya-hallani.dev",
  name: "Yahya Hallani",
  roleLine: "Software Engineering at McGill",
  skipLabel: "Skip to content",
  navLabel: "Sections",
  headerNavLabel: "Contact",
  indexHeaderLabel: "Index",
  resume: { label: "Resume (PDF)", href: "/yahya-hallani-resume.pdf" },
  footer: {
    nextPrefix: "Next, ",
    backToStart: "Back to the start",
    counterSeparator: " / ",
  },
  contact: {
    email: "yahya.hallani.email@gmail.com",
    linkedin: "https://www.linkedin.com/in/yahya-hallani",
    github: "https://github.com/Yahya-github",
  },
} as const satisfies Site;

export const sections = [
  {
    slug: "index",
    route: "/",
    letter: null,
    number: "00",
    name: "Index",
    title: "Yahya Hallani",
    description:
      "Yahya Hallani, Software Engineering at McGill. Competition results, projects and experience.",
  },
  {
    slug: "achievements",
    route: "/achievements/",
    letter: "Y",
    number: "01",
    name: "Achievements",
    title: "Achievements, Yahya Hallani",
    description:
      "A perfect score at the Canadian Computing Competition and first places at the DIRO Hackathon, the Intercollegiate Video Game Creation Competition and the Canadian Robotics Competition.",
  },
  {
    slug: "projects",
    route: "/projects/",
    letter: "A",
    number: "02",
    name: "Projects",
    title: "Projects, Yahya Hallani",
    description:
      "Facturo, a local-first invoicing app with more than 700 tests, plus MAME Tool Rental, Atlantis, CRC problems, robot firmware and Showdown AI.",
  },
  {
    slug: "experience",
    route: "/experience/",
    letter: "H",
    number: "03",
    name: "Experience",
    title: "Experience, Yahya Hallani",
    description:
      "Work at MAME Tool Rental, Mercor, Facturo and CRC 2027, freelance since 2025, and involvement in McGill Robotics, GDG at McGill and ICPC.",
  },
  {
    slug: "about",
    route: "/about/",
    letter: "Y",
    number: "04",
    name: "About",
    title: "About, Yahya Hallani",
    description:
      "Two habits: I decide fast under pressure, and I build things that run themselves.",
  },
  {
    slug: "say-hi",
    route: "/say-hi/",
    letter: "A",
    number: "05",
    name: "Say hi",
    title: "Say hi, Yahya Hallani",
    description: "Email, LinkedIn, GitHub and the resume of Yahya Hallani.",
  },
] as const satisfies readonly Section[];
