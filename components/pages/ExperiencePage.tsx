import type { CSSProperties } from "react";
import { experience } from "@/content/experience";
import { displayFitStyle } from "@/lib/display-fit";
import { Heading, PageTitle } from "./Heading";
import styles from "./experience-page.module.css";

export function ExperiencePage() {
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
            <li key={`${w.date}-${w.role}`} className={styles.row}>
              <p className="t-label c-dim tnum">{w.date}</p>
              <p className={`t-heading ${styles.role}`}>{w.role}</p>
              <p className="t-body c-dim">{w.organisation}</p>
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
            <li key={i.organisation} className={styles.row}>
              <p className="t-heading">{i.role}</p>
              <p className="t-body c-dim">{i.organisation}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
