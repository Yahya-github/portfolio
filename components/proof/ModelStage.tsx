import { Photo } from "@/components/media/Photo";
import type { RobotContent } from "@/content/types";
import { proofMedia } from "@/lib/proof/media";
import styles from "./proof.module.css";

interface ModelStageProps {
  readonly content: RobotContent;
  readonly viewerOn: boolean;
  readonly src: string | null;
}

const STILL_SIZES = "(max-width: 820px) 100vw, 75vw";

/** Robot stage: the still first, hooks for the viewer (08-12) only when the gate allows it. */
export function ModelStage({ content, viewerOn, src }: ModelStageProps) {
  const { still, viewer } = content;
  const live = viewerOn && src !== null;
  return (
    <figure
      data-model=""
      data-model-src={live ? src : undefined}
      className={styles.modelStage}
    >
      <div className={styles.modelFrame}>
        <div data-model-still="" className={styles.modelStillWrap}>
          <Photo
            sources={proofMedia(still.key)}
            alt={still.alt}
            sizes={STILL_SIZES}
            eager
            className={styles.modelStill}
          />
        </div>
        <div data-model-slot="" className={styles.modelSlot} />
      </div>
      {live ? (
        <div className={`t-label ${styles.modelControls}`}>
          <span className={styles.hint} data-model-hint="">
            {viewer.hintDrag}
          </span>
          <button
            type="button"
            data-model-action="reset"
            className={styles.control}
          >
            {viewer.reset}
          </button>
          <span id="robot-viewer-desc" className="visually-hidden">
            {viewer.description}
          </span>
        </div>
      ) : null}
      {still.caption ? (
        <figcaption className={`t-label c-dim ${styles.modelCaption}`}>
          {still.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
