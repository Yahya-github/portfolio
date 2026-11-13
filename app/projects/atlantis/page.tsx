import type { Metadata } from "next";
import { ProofClient } from "@/components/proof/ProofClient";
import { DeepDiveFooter } from "@/components/deep-dive/DeepDiveFooter";
import styles from "@/components/deep-dive/deep-dive.module.css";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import { LetterNav } from "@/components/letters/LetterNav";
import { Photo } from "@/components/media/Photo";
import { GameStage } from "@/components/proof/GameStage";
import { ProofRoute } from "@/components/proof/ProofRoute";
import proof from "@/components/proof/proof.module.css";
import { atlantis } from "@/content/atlantis";
import { atlantisBuild } from "@/content/generated/atlantis-build";
import { proofGate } from "@/content/proof-gate";
import { atlantisPlayable } from "@/lib/proof/gate";
import { proofMedia } from "@/lib/proof/media";
import { deepDiveMetadata } from "@/lib/metadata";

const playable = atlantisPlayable(proofGate, atlantisBuild);

export const metadata: Metadata = deepDiveMetadata(
  playable
    ? atlantis
    : { ...atlantis, metaDescription: atlantis.metaDescriptionFallback },
);

const GALLERY_SIZES = "(max-width: 820px) 100vw, 25vw";

/** Standalone vertical page outside the pager shell (D-01, D-03). */
export default function Page() {
  return (
    <>
      <SkipLink />
      <Header current="projects" label={atlantis.headerLabel} />
      <LetterNav current="projects" currentMarker="true" />
      <main
        id="content"
        tabIndex={-1}
        data-dive="atlantis"
        className={styles.main}
      >
        <ProofRoute
          content={atlantis}
          stage={
            <GameStage
              content={atlantis}
              playable={playable}
              sizeMB={atlantisBuild?.totalMB ?? null}
              src={atlantisBuild?.path ?? null}
            />
          }
          gallery={atlantis.gallery.map((img) => (
            <figure key={img.key} className={proof.figure}>
              <Photo
                sources={proofMedia(img.key)}
                alt={img.alt}
                sizes={GALLERY_SIZES}
                eager={false}
                className={proof.shot}
              />
              {img.caption ? (
                <figcaption className={`t-label c-dim ${proof.caption}`}>
                  {img.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        />
      </main>
      <DeepDiveFooter project="atlantis" backLabel={atlantis.backLabel} />
      <ProofClient feature="game" />
    </>
  );
}
