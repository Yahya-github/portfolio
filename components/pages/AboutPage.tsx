import { PortraitToggle } from "@/components/media/PortraitToggle";
import { about } from "@/content/about";
import { PageTitle } from "./Heading";
import type { PageProps } from "./types";
import styles from "./about-page.module.css";

export function AboutPage({ isCurrent }: PageProps) {
  return (
    <div className={`grid ${styles.root}`}>
      <div className={styles.portrait}>
        <PortraitToggle eager={isCurrent} />
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
