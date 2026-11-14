import { Photo } from "@/components/media/Photo";
import type { AtlantisContent } from "@/content/types";
import { proofMedia } from "@/lib/proof/media";
import styles from "./proof.module.css";

interface GameStageProps {
  readonly content: AtlantisContent;
  readonly playable: boolean;
  readonly sizeMB: string | null;
  readonly src: string | null;
}

const POSTER_SIZES = "(max-width: 820px) 100vw, 75vw";

/** Atlantis stage markup for every state; 08-10 attaches behaviour through the data hooks. */
export function GameStage({ content, playable, sizeMB, src }: GameStageProps) {
  const { game, poster } = content;
  const showControls = playable && sizeMB !== null && src !== null;
  return (
    <section
      data-game=""
      data-game-state="ready"
      data-game-src={showControls ? src : undefined}
      className={styles.game}
    >
      {showControls ? (
        <div className={`t-label ${styles.controls}`}>
          <button
            type="button"
            data-game-action="play"
            className={`t-heading ${styles.play}`}
          >
            {game.play}
          </button>
          <span className="c-dim" data-game-size="">
            {game.sizeLine.replace("{size}", sizeMB)}
          </span>
          <span className="c-dim tnum" data-game-status="" aria-live="polite" />
          <button
            type="button"
            data-game-action="exit"
            className={styles.control}
          >
            {game.exit}
          </button>
          <button
            type="button"
            data-game-action="mute"
            aria-label={game.muteName}
            className={styles.control}
          >
            {game.mute}
          </button>
          <span className="c-dim" data-game-hint="">
            {game.escHint}
          </span>
          <p className="t-body c-dim" data-game-error="">
            {game.loadError}
          </p>
          <button
            type="button"
            data-game-action="retry"
            className={styles.control}
          >
            {game.retry}
          </button>
          <p className="t-body c-dim" data-game-line="" />
        </div>
      ) : null}
      <div className={styles.stage}>
        <div
          className={styles.poster}
          data-game-poster=""
          data-cursor-tag={showControls ? game.posterCursorTag : undefined}
        >
          <Photo
            sources={proofMedia(poster.key)}
            alt={poster.alt}
            sizes={POSTER_SIZES}
            eager
            className={styles.posterImg}
          />
        </div>
        <div data-game-slot="" className={styles.slot} />
        <div data-game-bar="" className={styles.bar} />
      </div>
      <noscript>
        <p className="t-body c-dim">{game.noscript}</p>
      </noscript>
      <span
        data-game-announce=""
        aria-live="polite"
        className="visually-hidden"
      />
    </section>
  );
}
