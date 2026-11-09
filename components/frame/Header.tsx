import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { headerLabel, sectionBySlug } from "@/lib/sections";
import styles from "./frame.module.css";

interface HeaderProps {
  readonly current: Slug;
}

export function Header({ current }: HeaderProps) {
  const sayHi = sectionBySlug("say-hi");
  return (
    <header className={`grid t-label ${styles.header}`}>
      <span className={styles.who}>{site.name}</span>
      <span className={`c-dim ${styles.where}`}>{headerLabel(current)}</span>
      <nav aria-label={site.headerNavLabel} className={styles.links}>
        <a href={site.resume.href}>{site.resume.label}</a>
        <a
          href={sayHi.route}
          aria-current={current === "say-hi" ? "page" : undefined}
        >
          {sayHi.name}
        </a>
      </nav>
    </header>
  );
}
