import type { MediaVariant } from "@/lib/media/types";

export interface PhotoProps {
  readonly sources: readonly MediaVariant[];
  readonly sizes: string;
  readonly alt: string;
  readonly eager: boolean;
  readonly className?: string;
  /** Marks the image so the pager's pre-decode skips it (D-09). */
  readonly defer?: boolean;
  /** Renders data-src instead of src so nothing downloads until a lazy module asks. Implies defer. */
  readonly onDemand?: boolean;
  readonly ariaHidden?: boolean;
  readonly twin?: "grey" | "colour";
}

export function Photo({
  sources,
  sizes,
  alt,
  eager,
  className,
  defer = false,
  onDemand = false,
  ariaHidden = false,
  twin,
}: PhotoProps) {
  const widest = sources.reduce((a, b) => (b.width > a.width ? b : a));
  const srcSet = sources.map((s) => `${s.src} ${s.width}w`).join(", ");
  const loadProps = onDemand
    ? { "data-src": widest.src, "data-srcset": srcSet, "data-sizes": sizes }
    : { src: widest.src, srcSet, sizes };
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export has no optimizer; sources are pre-sized WebP (Pitfall 9)
    <img
      className={className}
      {...loadProps}
      width={widest.width}
      height={widest.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      aria-hidden={ariaHidden ? "true" : undefined}
      data-twin={twin}
      data-defer={defer || onDemand ? "" : undefined}
    />
  );
}
