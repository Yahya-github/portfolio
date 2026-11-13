import type { CSSProperties, ReactNode } from "react";
import dive from "@/components/deep-dive/deep-dive.module.css";
import type { ProofRouteContent } from "@/content/types";
import { displayFitStyle } from "@/lib/display-fit";
import { ProofLinks } from "./ProofLinks";
import styles from "./proof.module.css";

interface ProofRouteProps {
  readonly content: ProofRouteContent<string>;
  readonly stage: ReactNode;
  readonly gallery?: ReactNode;
}

/** Shared lean layout for the proof routes: Display title, stage, side column (D-03). */
export function ProofRoute({ content, stage, gallery }: ProofRouteProps) {
  const [lead, ...rest] = content.lines;
  return (
    <article className={`grid dive-surface-${content.project} ${styles.body}`}>
      {/* The name sits on the h1: a two-word title must still be one transition name. */}
      <h1
        tabIndex={-1}
        className={`t-display dive-title-${content.project} ${dive.title}`}
      >
        {content.titleWords.map((word) => (
          <span
            key={word}
            style={displayFitStyle(word) as CSSProperties}
            className={dive.titleWord}
          >
            {word}
          </span>
        ))}
      </h1>
      <div className={styles.stageCol}>{stage}</div>
      <div className={styles.side}>
        <hr className={dive.rule} />
        <div className={styles.lines}>
          <p className="t-body measure">{lead}</p>
          {rest.map((line) => (
            <p key={line} className="t-body c-dim measure">
              {line}
            </p>
          ))}
        </div>
        <ul className={`t-label c-dim ${styles.meta}`}>
          {content.meta.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <ProofLinks links={content.links} className={styles.links} />
      </div>
      {gallery ? <div className={styles.galleryCol}>{gallery}</div> : null}
    </article>
  );
}
