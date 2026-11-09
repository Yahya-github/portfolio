import type { StaticImageData } from "next/image";

export interface PhotoProps {
  readonly sources: readonly StaticImageData[];
  readonly sizes: string;
  readonly alt: string;
  readonly eager: boolean;
  readonly className?: string;
}

export function Photo({ sources, sizes, alt, eager, className }: PhotoProps) {
  const widest = sources.reduce((a, b) => (b.width > a.width ? b : a));
  const srcSet = sources.map((s) => `${s.src} ${s.width}w`).join(", ");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export has no optimizer; sources are pre-sized WebP (Pitfall 9)
    <img
      className={className}
      src={widest.src}
      srcSet={srcSet}
      sizes={sizes}
      width={widest.width}
      height={widest.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
