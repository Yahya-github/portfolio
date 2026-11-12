import type { MarkName } from "@/content/types";
import { media } from "@/lib/media/manifest";
import styles from "./org-mark.module.css";

export interface OrgMarkProps {
  readonly name: MarkName;
  readonly eager: boolean;
}

/**
 * Decorative organisation mark (CONT-12). Mono at rest; the colour layer
 * has a real src so CSS hover works with JS off (Open Question 1 default).
 */
export function OrgMark({ name, eager }: OrgMarkProps) {
  const mono = media[`marks/${name}-mark-mono`][0];
  const colour = media[`marks/${name}-mark`][0];
  return (
    <span aria-hidden="true" data-mark={name} className={styles.mark}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized self-hosted marks */}
      <img
        className={styles.mono}
        src={mono.src}
        width={mono.width}
        height={mono.height}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized self-hosted marks */}
      <img
        className={styles.colour}
        src={colour.src}
        width={colour.width}
        height={colour.height}
        alt=""
        loading="lazy"
        decoding="async"
        data-defer=""
      />
    </span>
  );
}
