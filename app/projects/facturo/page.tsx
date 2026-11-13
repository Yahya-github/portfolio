import type { Metadata } from "next";
import { DeepDiveFooter } from "@/components/deep-dive/DeepDiveFooter";
import { FacturoDeepDive } from "@/components/deep-dive/FacturoDeepDive";
import { StandaloneClient } from "@/components/deep-dive/StandaloneClient";
import styles from "@/components/deep-dive/deep-dive.module.css";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import { LetterNav } from "@/components/letters/LetterNav";
import { facturo } from "@/content/facturo";
import { deepDiveMetadata } from "@/lib/metadata";

export const metadata: Metadata = deepDiveMetadata(facturo);

/** Standalone vertical page outside the pager shell (D-01). The document scrolls. */
export default function Page() {
  return (
    <>
      <SkipLink />
      <Header current="projects" label={facturo.headerLabel} />
      <LetterNav current="projects" currentMarker="true" />
      <main
        id="content"
        tabIndex={-1}
        data-dive="facturo"
        className={styles.main}
      >
        <FacturoDeepDive />
      </main>
      <DeepDiveFooter project="facturo" backLabel={facturo.backLabel} />
      <StandaloneClient />
    </>
  );
}
