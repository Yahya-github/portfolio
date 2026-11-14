import type { ReactNode } from "react";
import styles from "./project-mark.module.css";

export type MarkProject = "facturo" | "atlantis" | "robot";

const VIEW_W = 600;
const VIEW_H = 330;
const BINARY_ROWS = ["01", "10", "01"] as const;
const STACK_OFFSETS = [-30, -150, -70, -190, -110] as const;

/** Facturo: a filled F, cut by the right and bottom edges, over an outlined % (TPS and TVQ). */
const facturo: ReactNode = (
  <>
    <text className={styles.outline} x="30" y="320" fontSize="330">
      %
    </text>
    <text
      className={styles.solid}
      x="605"
      y="400"
      fontSize="520"
      textAnchor="end"
    >
      F
    </text>
  </>
);

/** Atlantis: stacked outlined fragments of the name behind a filled A, like depth soundings. */
const atlantis: ReactNode = (
  <>
    {STACK_OFFSETS.map((dx, row) => (
      <text
        key={dx}
        className={styles.outline}
        x={dx}
        y={52 + row * 62}
        fontSize="68"
      >
        ATLANTIS ATLANTIS
      </text>
    ))}
    <text
      className={styles.solid}
      x="615"
      y="450"
      fontSize="600"
      textAnchor="end"
    >
      A
    </text>
  </>
);

/** Robot: a filled R cut by the corner, with a tinted binary block for firmware. */
const robot: ReactNode = (
  <>
    {BINARY_ROWS.map((bits, row) => (
      <text
        key={row}
        className={styles.tint}
        x="-6"
        y={108 + row * 112}
        fontSize="130"
      >
        {bits}
      </text>
    ))}
    <text
      className={styles.solid}
      x="615"
      y="450"
      fontSize="600"
      textAnchor="end"
    >
      R
    </text>
  </>
);

const SHAPES: Readonly<Record<MarkProject, ReactNode>> = {
  facturo,
  atlantis,
  robot,
};

/**
 * Opening colour mark for a project page: a big Swiss letterform in the project colour,
 * cropped by the viewport corner, with one project-specific typographic shape. Decorative.
 */
export function ProjectMark({ project }: { readonly project: MarkProject }) {
  return (
    <div aria-hidden="true" className={styles.mark} data-mark={project}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMaxYMin slice"
        focusable="false"
      >
        {SHAPES[project]}
      </svg>
    </div>
  );
}
