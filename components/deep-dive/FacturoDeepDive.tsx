import type { CSSProperties } from "react";
import { Photo } from "@/components/media/Photo";
import { facturo } from "@/content/facturo";
import type { DeepDiveImage } from "@/content/types";
import { displayFitStyle } from "@/lib/display-fit";
import { media } from "@/lib/media/manifest";
import { ProjectMark } from "./ProjectMark";
import styles from "./deep-dive.module.css";

const SIZES = "(max-width: 820px) 100vw, 45vw";

interface ShotProps {
  readonly image: DeepDiveImage;
  readonly eager: boolean;
  readonly className: string;
}

function Shot({ image, eager, className }: ShotProps) {
  return (
    <Photo
      sources={media[`facturo/${image.frame}`]}
      alt={image.alt}
      sizes={SIZES}
      eager={eager}
      className={className}
    />
  );
}

/** Facturo deep dive body (CONT-04): title, lead, meta and ruled sections (D-02). */
export function FacturoDeepDive() {
  return (
    <article
      className={`grid dive-surface-facturo ${styles.hasMark} ${styles.body}`}
    >
      <ProjectMark project="facturo" />
      <h1 tabIndex={-1} className={`t-display ${styles.title}`}>
        <span
          style={displayFitStyle(facturo.title) as CSSProperties}
          className={`dive-title-facturo ${styles.titleWord}`}
        >
          {facturo.title}
        </span>
      </h1>
      <p className={`t-body measure ${styles.lead}`}>{facturo.lead}</p>
      <ul className={`t-label c-dim ${styles.meta}`}>
        {facturo.meta.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      {facturo.sections.map((s) => (
        <section
          key={s.id}
          aria-labelledby={`dd-${s.id}`}
          className={styles.section}
        >
          <h2 id={`dd-${s.id}`} className={`t-heading ${styles.h2}`}>
            {s.heading}
          </h2>
          <div className={styles.text}>
            {s.paragraphs.map((p, i) => (
              <p key={p} className={`t-body measure${i > 0 ? " c-dim" : ""}`}>
                {p}
              </p>
            ))}
          </div>
          <div className={styles.shots}>
            {s.id === "built" ? (
              <>
                <Shot
                  image={s.images[0]}
                  eager={false}
                  className={styles.full}
                />
                <Shot
                  image={s.images[1]}
                  eager={false}
                  className={styles.pair}
                />
                <Shot
                  image={s.images[2]}
                  eager={false}
                  className={styles.phone}
                />
              </>
            ) : (
              s.images.map((img) => (
                <Shot
                  key={img.frame}
                  image={img}
                  eager={s.id === "problem"}
                  className={styles.full}
                />
              ))
            )}
          </div>
        </section>
      ))}
      <section aria-labelledby="dd-links" className={styles.section}>
        <h2 id="dd-links" className={`t-heading ${styles.h2}`}>
          {facturo.links.heading}
        </h2>
        <ul className={styles.links}>
          {facturo.links.items.map((item) => (
            <li key={item.href}>
              <a
                className={`t-heading ulink ${styles.link}`}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </a>
              {item.source ? (
                <span className={`t-label c-dim ${styles.source}`}>
                  {item.source}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
