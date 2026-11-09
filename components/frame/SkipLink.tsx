import { site } from "@/content/site";
import styles from "./frame.module.css";

export function SkipLink() {
  return (
    <a href="#content" className={`t-label ${styles.skip}`}>
      {site.skipLabel}
    </a>
  );
}
