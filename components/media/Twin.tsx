import { Photo } from "@/components/media/Photo";
import type { MediaVariant } from "@/lib/media/types";

export interface TwinProps {
  readonly grey: readonly MediaVariant[];
  readonly colour: readonly MediaVariant[];
  readonly sizes: string;
  readonly alt: string;
  readonly eager: boolean;
  readonly colourOnDemand: boolean;
  readonly greyClassName?: string;
  readonly colourClassName?: string;
}

/** Grey image plus its decorative colour twin (D-09). The twin carries no alt text. */
export function Twin({
  grey,
  colour,
  sizes,
  alt,
  eager,
  colourOnDemand,
  greyClassName,
  colourClassName,
}: TwinProps) {
  return (
    <>
      <Photo
        sources={grey}
        sizes={sizes}
        alt={alt}
        eager={eager}
        twin="grey"
        className={greyClassName}
      />
      <Photo
        sources={colour}
        sizes={sizes}
        alt=""
        eager={false}
        twin="colour"
        defer
        onDemand={colourOnDemand}
        className={colourClassName}
      />
    </>
  );
}
