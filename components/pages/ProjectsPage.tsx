import type { CSSProperties } from "react";
import f960 from "@/assets/facturo-01-960.webp";
import f1440 from "@/assets/facturo-01-1440.webp";
import { Photo } from "@/components/media/Photo";
import { Heading, PageTitle } from "@/components/pages/Heading";
import type { PageProps } from "@/components/pages/types";
import { projects } from "@/content/projects";
import { displayFitStyle } from "@/lib/display-fit";
import styles from "./projects-page.module.css";

const FACTURO_SIZES = "(max-width: 820px) 100vw, 60vw";

/**
 * 02 Projects. Greyscale Facturo still and lead in cols 1-8, five compact
 * ruled rows in cols 9-12. The case-study link and walkthrough wait for Phase 6 (D-13).
 */
export function ProjectsPage({ headingLevel, isCurrent }: PageProps) {
  const sub = (headingLevel + 1) as 2 | 3;
  return (
    <div className={`grid ${styles.root}`}>
      <PageTitle
        slug="projects"
        level={headingLevel}
        text={projects.title}
        className={styles.title}
      />
      <div className={styles.lead}>
        <div className={styles.still}>
          <Photo
            sources={[f960, f1440]}
            sizes={FACTURO_SIZES}
            alt={projects.flagship.imageAlt}
            eager={isCurrent}
            className={styles.img}
          />
        </div>
        <Heading level={sub} className={`t-display ${styles.name}`}>
          <span
            style={displayFitStyle(projects.flagship.name) as CSSProperties}
            className={styles.nameWord}
          >
            {projects.flagship.name}
          </span>
        </Heading>
        <p className={`t-body ${styles.leadLine}`}>
          {projects.flagship.lines[0]}
        </p>
        <p className={`t-body c-dim ${styles.leadLine}`}>
          {projects.flagship.lines[1]}
        </p>
      </div>
      <ol className={styles.rows}>
        {projects.rows.map((r) => (
          <li key={r.number} className={styles.row}>
            <div className={styles.head}>
              <span className="t-label c-dim tnum">{r.number}</span>
              <Heading level={sub} className="t-heading">
                {r.name}
              </Heading>
              {r.link ? (
                <a
                  className={`t-label ulink ${styles.link}`}
                  href={r.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.link.label}
                </a>
              ) : null}
            </div>
            <p className="t-body c-dim">{r.lines[0]}</p>
            <p className={`t-body c-dim ${styles.mid}`}>{r.lines[1]}</p>
            <p className="t-body c-dim">{r.lines[2]}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
