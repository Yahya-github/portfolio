import type { ReactNode } from "react";
import styles from "./project-mark.module.css";

export type MarkProject = "facturo" | "atlantis" | "robot";

/** Every pictogram is drawn on one square 400 grid and keeps clear of the edge. */
const VIEW = 400;
const CENTRE = VIEW / 2;

const round = (n: number): number => Math.round(n * 10) / 10;

/** Cog outline: trapezoid teeth around the centre, computed once at build time. */
function gearPath(
  teeth: number,
  outerR: number,
  rootR: number,
  toothFrac: number,
): string {
  const step = (Math.PI * 2) / teeth;
  const half = (step * toothFrac) / 2;
  const root = (step * (1 - toothFrac)) / 2;
  const points: string[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const mid = i * step - Math.PI / 2;
    const angles: ReadonlyArray<readonly [number, number]> = [
      [mid - half - root, rootR],
      [mid - half * 0.7, outerR],
      [mid + half * 0.7, outerR],
      [mid + half + root, rootR],
    ];
    for (const [a, r] of angles) {
      points.push(
        `${round(CENTRE + r * Math.cos(a))} ${round(CENTRE + r * Math.sin(a))}`,
      );
    }
  }
  return `M${points.join("L")}Z`;
}

/** Bolt holes round the porthole ring, as negative space. */
function boltPath(count: number, ringR: number, boltR: number): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i * Math.PI * 2) / count + Math.PI / count;
    const cx = round(CENTRE + ringR * Math.cos(a));
    const cy = round(CENTRE + ringR * Math.sin(a));
    parts.push(
      `M${round(cx - boltR)} ${cy}a${boltR} ${boltR} 0 1 0 ${boltR * 2} 0a${boltR} ${boltR} 0 1 0 ${-boltR * 2} 0Z`,
    );
  }
  return parts.join("");
}

const CIRCLE = (r: number): string =>
  `M${CENTRE - r} ${CENTRE}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;

/** Facturo: an invoice ticket with a torn zigzag edge, an F and two ruled lines cut out of it. */
const FACTURO_PATH =
  "M90 30H310V346L283 370L255 346L228 370L200 346L172 370L145 346L117 370L90 346Z" +
  "M130 84H270V122H172V142H250V178H172V240H130Z" +
  "M130 272H270V290H130Z" +
  "M130 308H214V326H130Z";

/** Atlantis: a bolted porthole ring around a glass disc with a sunken-column A cut out of it. */
const ATLANTIS_PATH =
  `${CIRCLE(190)}${CIRCLE(136)}${boltPath(8, 163, 9)}` +
  `${CIRCLE(130)}` +
  "M181 96H219L284 284H246L236 254H164L154 284H116Z" +
  "M200 140L176 222H224Z";

/** Robot: a cog with an R cut out of its hub. */
const ROBOT_PATH =
  `${gearPath(10, 188, 150, 0.46)}` +
  "M138 112H214A56 56 0 0 1 214 224L266 292H218L178 238V292H138Z" +
  "M178 150H210A18 18 0 0 1 210 186H178Z";

const SHAPES: Readonly<Record<MarkProject, ReactNode>> = {
  facturo: <path d={FACTURO_PATH} fillRule="evenodd" />,
  atlantis: <path d={ATLANTIS_PATH} fillRule="evenodd" />,
  robot: <path d={ROBOT_PATH} fillRule="evenodd" />,
};

/**
 * Opening colour mark for a project page: one whole, flat pictogram in the project colour
 * (ticket, porthole, cog), with the name's initial carved out as negative space. Decorative.
 */
export function ProjectMark({ project }: { readonly project: MarkProject }) {
  return (
    <div aria-hidden="true" className={styles.mark} data-mark={project}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        focusable="false"
      >
        {SHAPES[project]}
      </svg>
    </div>
  );
}
