import { Photo } from "@/components/media/Photo";
import { about } from "@/content/about";
import { media } from "@/lib/media/manifest";
import { PageTitle } from "./Heading";
import type { PageProps } from "./types";
import styles from "./about-page.module.css";

const PORTRAIT_SOURCES = media["portrait/portrait-devfest-2026-grey"];

// Pitfall 3 / user decision 2026-11-08: describe the drawn width
// (object-fit: cover in a tall column), not the slot width.
const PORTRAIT_SIZES = "(max-width: 820px) 100vw, calc((100vh - 128px) * 1.22)";

export function AboutPage({ isCurrent }: PageProps) {
  return (
    <div className={`grid ${styles.root}`}>
      <div className={styles.portrait}>
        <Photo
          sources={PORTRAIT_SOURCES}
          sizes={PORTRAIT_SIZES}
          alt={about.portraitAlt}
          eager={isCurrent}
          className={styles.img}
        />
      </div>
      <PageTitle
        slug="about"
        text={about.title}
        className={`t-display ${styles.title}`}
      >
        {about.titleRows.map((r) => (
          <span key={r} className={styles.row}>
            {r}
          </span>
        ))}
      </PageTitle>
      <div className={`measure ${styles.text}`}>
        <p className={styles.lead}>{about.lead}</p>
        <p className="t-body">{about.paragraph}</p>
      </div>
    </div>
  );
}
