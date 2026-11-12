import type { ReactNode } from "react";
import { QuarterRings } from "@/components/devices/QuarterRings";
import { PortraitToggle } from "@/components/media/PortraitToggle";
import { about } from "@/content/about";
import { PageTitle } from "./Heading";
import type { PageProps } from "./types";
import styles from "./about-page.module.css";

/** Splits the paragraph on each link text (in order) and wraps it in an external link. */
function renderParagraph(): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest: string = about.paragraph;
  for (const link of about.paragraphLinks) {
    const at = rest.indexOf(link.text);
    if (at < 0) continue;
    parts.push(rest.slice(0, at));
    parts.push(
      <a
        key={link.href}
        className="ulink"
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.text}
      </a>,
    );
    rest = rest.slice(at + link.text.length);
  }
  parts.push(rest);
  return parts;
}

export function AboutPage({ isCurrent }: PageProps) {
  return (
    <div className={`grid ${styles.root}`}>
      <div className={styles.portrait}>
        <PortraitToggle eager={isCurrent} />
      </div>
      <QuarterRings />
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
        <p className="t-body">{renderParagraph()}</p>
      </div>
    </div>
  );
}
