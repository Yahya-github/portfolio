import { Footer } from "@/components/frame/Footer";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import { LetterNav } from "@/components/letters/LetterNav";
import type { Slug } from "@/content/types";
import { Track } from "./Track";

interface ShellProps {
  readonly current: Slug;
}

/** Binding DOM order (UI-SPEC): SkipLink, Header, LetterNav, Track, Footer. */
export function Shell({ current }: ShellProps) {
  return (
    <>
      <SkipLink />
      <Header current={current} />
      <LetterNav current={current} />
      <Track current={current} />
      <Footer current={current} />
    </>
  );
}
