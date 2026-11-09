import { Footer } from "@/components/frame/Footer";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import { LetterNav } from "@/components/letters/LetterNav";
import type { Slug } from "@/content/types";
import { indexOfSlug } from "@/lib/sections";
import { LiveRegion } from "./LiveRegion";
import { PagerProvider } from "./PagerProvider";
import { Track } from "./Track";

interface ShellProps {
  readonly current: Slug;
}

/** Binding DOM order (UI-SPEC): SkipLink, Header, LetterNav, Track, Footer, LiveRegion. */
export function Shell({ current }: ShellProps) {
  return (
    <PagerProvider initial={indexOfSlug(current)}>
      <SkipLink />
      <Header current={current} />
      <LetterNav current={current} />
      <Track current={current} />
      <Footer current={current} />
      <LiveRegion />
    </PagerProvider>
  );
}
