import type { CSSProperties } from "react";
import { EdgeNumber } from "@/components/devices/EdgeNumber";
import { OrgMark } from "@/components/media/OrgMark";
import { experience } from "@/content/experience";
import { displayFitStyle } from "@/lib/display-fit";
import { Heading, PageTitle } from "./Heading";
import type { PageProps } from "./types";
import styles from "./experience-page.module.css";

// isCurrent is optional here: tests/pages-experience-sayhi.test.tsx (plan 06-08) renders it bare.
export function ExperiencePage({ isCurrent = false }: Partial<PageProps>) {
  return (
    <div className={`grid ${styles.root}`}>
      <PageTitle slug="experience" text={experience.title} />
      <div className={styles.work}>
        <Heading offset={1} className={`t-display ${styles.head}`}>
          <span
            className={styles.word}
            style={displayFitStyle(experience.workHead) as CSSProperties}
          >
            {experience.workHead}
          </span>
        </Heading>
        <ol className={styles.table}>
          {experience.work.map((w) => (
            <li
              key={`${w.date}-${w.role}`}
              className={w.mark ? `${styles.row} ${styles.marked}` : styles.row}
              data-tap-colour={w.mark ? "" : undefined}
            >
              <div className={styles.text}>
                <p className="t-label c-dim tnum">{w.date}</p>
                <p className={`t-heading ${styles.role}`}>{w.role}</p>
                <p className="t-body c-dim">{w.organisation}</p>
              </div>
              {w.mark ? <OrgMark name={w.mark} eager={isCurrent} /> : null}
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.involvement}>
        <Heading offset={1} className={`t-display ${styles.head}`}>
          <span
            className={styles.word}
            style={displayFitStyle(experience.involvementHead) as CSSProperties}
          >
            {experience.involvementHead}
          </span>
        </Heading>
        <ul className={styles.table}>
          {experience.involvement.map((i) => (
            <li
              key={i.organisation}
              className={i.mark ? `${styles.row} ${styles.marked}` : styles.row}
              data-tap-colour={i.mark ? "" : undefined}
            >
              <div className={styles.text}>
                <p className="t-heading">{i.role}</p>
                <p className="t-body c-dim">{i.organisation}</p>
              </div>
              {i.mark ? <OrgMark name={i.mark} eager={isCurrent} /> : null}
            </li>
          ))}
        </ul>
      </div>
      <EdgeNumber slug="experience" />
    </div>
  );
}
