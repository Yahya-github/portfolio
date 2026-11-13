import type { Metadata } from "next";
import { StandaloneClient } from "@/components/deep-dive/StandaloneClient";
import { DeepDiveFooter } from "@/components/deep-dive/DeepDiveFooter";
import styles from "@/components/deep-dive/deep-dive.module.css";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import { LetterNav } from "@/components/letters/LetterNav";
import { Photo } from "@/components/media/Photo";
import { ModelStage } from "@/components/proof/ModelStage";
import { ProofRoute } from "@/components/proof/ProofRoute";
import proof from "@/components/proof/proof.module.css";
import { robot } from "@/content/robot";
import { robotModel } from "@/content/generated/robot-model";
import { proofGate } from "@/content/proof-gate";
import { robotViewerOn } from "@/lib/proof/gate";
import { proofMedia } from "@/lib/proof/media";
import { deepDiveMetadata } from "@/lib/metadata";

const viewerOn = robotViewerOn(proofGate, robotModel);

export const metadata: Metadata = deepDiveMetadata(
  viewerOn ? robot : { ...robot, metaDescription: robot.metaDescriptionStill },
);

const GALLERY_SIZES = "(max-width: 820px) 100vw, 25vw";

/** Standalone vertical page outside the pager shell (D-01, D-03). */
export default function Page() {
  return (
    <>
      <SkipLink />
      <Header current="projects" label={robot.headerLabel} />
      <LetterNav current="projects" currentMarker="true" />
      <main
        id="content"
        tabIndex={-1}
        data-dive="robot"
        className={styles.main}
      >
        <ProofRoute
          content={robot}
          stage={
            <ModelStage
              content={robot}
              viewerOn={viewerOn}
              src={robotModel?.src ?? null}
            />
          }
          gallery={robot.gallery.map((img) => (
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
      <DeepDiveFooter
        project="robot"
        backLabel={robot.backLabel}
        motion={viewerOn}
      />
      <StandaloneClient />
    </>
  );
}
