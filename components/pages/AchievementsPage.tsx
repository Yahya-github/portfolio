import type { CSSProperties } from "react";
import { PageTitle } from "@/components/pages/Heading";
import {
  ProofPreview,
  type ProofPreviewContent,
} from "@/components/media/ProofPreview";
import { achievements } from "@/content/achievements";
import type { AchievementLine } from "@/content/types";
import { displayFitStyle } from "@/lib/display-fit";
import { media } from "@/lib/media/manifest";
import styles from "./achievements-page.module.css";

const PREVIEW_SIZES = "(max-width: 820px) 40vw, 17vw";

function previewOf(l: AchievementLine): ProofPreviewContent {
  const p = l.preview;
  if (p.kind === "text") return p;
  return {
    kind: "photo",
    grey: media[`achievements/${p.photo}-grey`],
    colour: media[`achievements/${p.photo}`],
    alt: p.alt,
    caption: p.caption,
  };
}

/**
 * 01 Achievements. Letter-pair title stack in cols 1-2, five lines on a
 * subgrid in cols 3-10. Cols 11-12 hold the proof previews (CONT-10).
 */
export function AchievementsPage() {
  return (
    <div className={`grid ${styles.root}`}>
      <PageTitle
        slug="achievements"
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
            <li key={l.result} className={styles.item} data-preview-item="">
              {l.href ? (
                <a
                  className={styles.line}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-trigger=""
                  data-cursor-tag={l.cursorTag ?? undefined}
                >
                  {body}
                </a>
              ) : (
                <div
                  className={styles.line}
                  tabIndex={0}
                  data-cursor-snap=""
                  data-preview-trigger=""
                >
                  {body}
                </div>
              )}
              <ProofPreview
                className={styles.preview}
                sizes={PREVIEW_SIZES}
                preview={previewOf(l)}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
