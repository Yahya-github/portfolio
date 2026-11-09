import type { CSSProperties } from "react";
import { sayHi } from "@/content/say-hi";
import { displayFitStyle } from "@/lib/display-fit";
import { PageTitle } from "./Heading";
import styles from "./say-hi-page.module.css";

const EXTERNAL_REL = "noopener noreferrer";

export function SayHiPage() {
  return (
    <div className={`grid ${styles.root}`}>
      <PageTitle slug="say-hi" text={sayHi.title} />
      <div className={styles.links}>
        {sayHi.lines.map((l) => (
          <a
            key={l.label}
            className={`t-display ${styles.line}`}
            href={l.href}
            style={displayFitStyle(l.label) as CSSProperties}
            target={l.external ? "_blank" : undefined}
            rel={l.external ? EXTERNAL_REL : undefined}
          >
            {l.label}
          </a>
        ))}
      </div>
      <p className={`t-label ${styles.side}`}>
        <a className={`ulink ${styles.addr}`} href={sayHi.address.href}>
          {sayHi.address.label}
        </a>
      </p>
    </div>
  );
}
