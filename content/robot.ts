import { achievements } from "./achievements";
import type { RobotContent } from "./types";

const trophiesAlt = ((): string => {
  for (const line of achievements.lines) {
    const p = line.preview;
    if (p.kind === "photo" && p.photo === "crc-2026-trophies") {
      return p.alt;
    }
  }
  throw new Error("CRC 2026 trophies photo missing from achievements");
})();

export const robot = {
  route: "/projects/robot/",
  project: "robot",
  title: "Robot firmware",
  titleWords: ["Robot", "firmware"],
  headerLabel: "02.5 Robot firmware",
  metaTitle: "Robot firmware, Yahya Hallani",
  metaDescription:
    "Firmware for the CRC 2026 robot: an embedded state machine in C/C++ with PID tuning. 1st place, robot competition, 2026. Rotate the 3D model.",
  metaDescriptionStill:
    "Firmware for the CRC 2026 robot: an embedded state machine in C/C++ with PID tuning. 1st place, robot competition, 2026.",
  lines: [
    "Firmware for the CRC 2026 robot.",
    "An embedded state machine in C/C++, PID tuning, and live debugging between matches.",
    "1st place, robot competition, 2026.",
  ],
  meta: [
    "The robot, rendered from its Onshape CAD",
    "Sep 2025 to Feb 2026",
    "Code is private",
  ],
  links: [
    {
      label: "Team site",
      href: "https://agisback.crcrobotics.com/fr/",
      source: "AG robotics team",
      external: true,
    },
  ],
  backLabel: "Back to Projects",
  still: {
    key: "robot/robot-still",
    alt: "The CRC 2026 robot, a colour render of its CAD model",
    caption: "The robot, rendered from its Onshape CAD",
  },
  gallery: [
    {
      key: "achievements/crc-2026-trophies",
      alt: trophiesAlt,
      caption: "The CRC 2026 team with its trophies",
    },
  ],
  viewer: {
    roleDescription: "3D viewer",
    groupLabel: "CRC 2026 robot, 3D model",
    description:
      "Drag or use the arrow keys to rotate. Home or Reset view returns to the start.",
    hintDrag: "Drag to rotate",
    hintKeys: "Arrow keys rotate",
    reset: "Reset view",
  },
} as const satisfies RobotContent;
