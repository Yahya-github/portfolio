import { Photo } from "@/components/media/Photo";
import { projects } from "@/content/projects";
import { media } from "@/lib/media/manifest";
import { counterText } from "@/lib/walkthrough/text";
import styles from "./walkthrough.module.css";

const SIZES = "(max-width: 820px) 100vw, 60vw";
const TALL_FRAME = "facturo-09-mobile";

interface WalkthroughProps {
  readonly isCurrent: boolean;
}

/**
 * Facturo walkthrough, server markup (CONT-11). Frame 1 is grey and eager; the other
 * nine and every colour twin carry data-src until lib/walkthrough/mount.ts asks.
 * With JS off, frame 1 shows and the controls stay hidden.
 */
export function Walkthrough({ isCurrent }: WalkthroughProps) {
  const w = projects.flagship.walkthrough;
  const c = w.controls;
  const actions = [
    { action: "pause", label: c.pause, name: c.pauseName },
    { action: "previous", label: c.previous, name: c.previousName },
    { action: "next", label: c.next, name: c.nextName },
  ] as const;
  return (
    <div className={styles.walk}>
      <div
        role="group"
        aria-roledescription={w.roleDescription}
        aria-label={w.groupLabel}
        tabIndex={0}
        data-walk=""
        className={styles.frame}
      >
        {w.frames.map(({ frame, alt }, i) => (
          <div
            key={frame}
            data-frame={i}
            data-tall={frame === TALL_FRAME ? "" : undefined}
            data-current={i === 0 ? "" : undefined}
            aria-hidden={i === 0 ? undefined : true}
            className={styles.fr}
          >
            <Photo
              twin="grey"
              sources={media[`facturo/${frame}-grey`]}
              alt={alt}
              sizes={SIZES}
              eager={i === 0 && isCurrent}
              onDemand={i > 0}
              className={styles.grey}
            />
            <Photo
              twin="colour"
              sources={media[`facturo/${frame}`]}
              alt=""
              sizes={SIZES}
              eager={false}
              onDemand
              className={styles.colour}
            />
          </div>
        ))}
      </div>
      <div data-walk-controls="" className={`t-label ${styles.controls}`}>
        {actions.map(({ action, label, name }) => (
          <button
            key={action}
            type="button"
            data-walk-action={action}
            aria-label={name}
            className={styles.btn}
          >
            {label}
          </button>
        ))}
        <span
          data-walk-counter=""
          aria-live="off"
          className={`c-dim tnum ${styles.counter}`}
        >
          {counterText(0, w.frames)}
        </span>
      </div>
      <span
        data-walk-status=""
        aria-live="polite"
        className="visually-hidden"
      />
    </div>
  );
}
