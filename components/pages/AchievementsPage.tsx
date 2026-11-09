import type { CSSProperties } from "react";
import { PageTitle } from "@/components/pages/Heading";
import type { PageProps } from "@/components/pages/types";
import { achievements } from "@/content/achievements";
import { displayFitStyle } from "@/lib/display-fit";
import styles from "./achievements-page.module.css";

/**
 * 01 Achievements. Letter-pair title stack in cols 1-2, five lines on a
 * subgrid in cols 3-10. Cols 11-12 stay empty (previews arrive in Phase 6).
 */
export function AchievementsPage({ headingLevel }: PageProps) {
  return (
    <div className={`grid ${styles.root}`}>
      <PageTitle
        slug="achievements"
        level={headingLevel}
        text={achievements.title}
        className={`t-display ${styles.title}`}
      >
        <span className={styles.rows}>
          {achievements.titleRows.map((r) => (
            <span key={r} className={styles.row}>
              {r}
            </span>
          ))}
        </span>
        <span
          className={styles.one}
          style={displayFitStyle(achievements.title) as CSSProperties}
        >
          {achievements.title}
        </span>
      </PageTitle>
      <ol className={styles.lines}>
        {achievements.lines.map((l) => {
          const rankClass = [
            "t-heading",
            styles.rank,
            l.accentRank ? "c-accent tnum" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const body = (
            <>
              <span className={rankClass}>{l.rank}</span>
              <span className={`t-heading ${styles.result}`}>{l.result}</span>
              <span className={`t-body c-dim ${styles.detail}`}>
                {l.detail}
              </span>
            </>
          );
          return (
            <li key={l.result} className={styles.item}>
              {l.href ? (
                <a
                  className={styles.line}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {body}
                </a>
              ) : (
                <div className={styles.line}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
