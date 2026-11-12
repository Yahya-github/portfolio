import type { MediaVariant } from "@/lib/media/types";
import styles from "./proof-preview.module.css";

type Caption = readonly [string, string];

export type ProofPreviewContent =
  | {
      readonly kind: "photo";
      readonly grey: readonly MediaVariant[];
      readonly colour: readonly MediaVariant[];
      readonly alt: string;
      readonly caption: Caption;
    }
  | { readonly kind: "text"; readonly caption: Caption };

export interface ProofPreviewProps {
  readonly preview: ProofPreviewContent;
  readonly sizes: string;
  readonly className?: string;
}

const srcSetOf = (v: readonly MediaVariant[]): string =>
  v.map((s) => `${s.src} ${s.width}w`).join(", ");

const widestOf = (v: readonly MediaVariant[]): MediaVariant =>
  v.reduce((a, b) => (b.width > a.width ? b : a));

function Caption({ caption }: { caption: Caption }) {
  return (
    <figcaption className="t-label">
      <span className={styles.cap}>{caption[0]}</span>
      <span className={`c-dim ${styles.cap}`}>{caption[1]}</span>
    </figcaption>
  );
}

/**
 * One proof preview (CONT-10). Revealed by CSS on hover and :focus-visible on
 * hover-capable desktops (colour source), inline greyscale thumbnail on touch.
 * The text kind has no image and is hidden on touch.
 */
export function ProofPreview({ preview, sizes, className }: ProofPreviewProps) {
  const cls = [styles.figure, className].filter(Boolean).join(" ");
  if (preview.kind === "text") {
    return (
      <figure
        data-preview=""
        data-preview-text=""
        aria-hidden="true"
        className={cls}
      >
        <Caption caption={preview.caption} />
      </figure>
    );
  }
  const widest = widestOf(preview.grey);
  return (
    <figure data-preview="" className={cls}>
      <picture>
        <source
          media="(hover: hover) and (min-width: 821px)"
          srcSet={srcSetOf(preview.colour)}
          sizes={sizes}
        />
        <img
          src={widest.src}
          srcSet={srcSetOf(preview.grey)}
          sizes={sizes}
          width={widest.width}
          height={widest.height}
          alt={preview.alt}
          loading="lazy"
          decoding="async"
          data-defer=""
          className={styles.img}
        />
      </picture>
      <Caption caption={preview.caption} />
    </figure>
  );
}
