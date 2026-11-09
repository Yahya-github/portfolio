/** Pager contracts (Phase 4). Inputs emit intents; everything else is a projection of PagerState. */
export type Source = "wheel" | "key" | "swipe" | "link" | "history";
export type Direction = "next" | "prev";
export type Intent =
  | {
      readonly type: "next" | "prev";
      readonly source: Source;
      readonly repeat?: boolean;
    }
  | { readonly type: "goto"; readonly index: number; readonly source: Source };
export type Phase = "idle" | "sliding";
export type LettersMode = "hero" | "rail";
export interface PagerState {
  readonly current: number; // last landed index
  readonly target: number; // where the track is heading (=== current at rest)
  readonly phase: Phase;
  readonly source: Source | null; // source of the latest accepted intent
  readonly slideId: number; // +1 on every accepted intent, including retargets
  readonly retarget: boolean; // latest accepted intent arrived while sliding (D-01)
  readonly focusHolder: number; // page that keeps inert off until landing (UI-SPEC Focus hand-off)
  readonly lettersMode: LettersMode; // D-09 stand-in
  readonly railEnter: boolean; // true only on the landing that switched hero -> rail
  readonly announced: number | null; // index for the live region; null on first load
  readonly landId: number; // +1 on every landing (e2e waits on it)
}
export interface EdgeInfo {
  readonly overflowing: boolean;
  readonly atStart: boolean;
  readonly atEnd: boolean;
}
export interface SlideOptions {
  readonly retarget: boolean;
  readonly reduced: boolean;
}
export interface Animator {
  /** Starts the slide from the rendered position. Resolves true when it finished, false when cancelled. Never rejects. */
  slideTo(index: number, options: SlideOptions): Promise<boolean>;
  /** Writes the resting --track-index / --page-index and cancels running animations in the same frame. */
  settle(index: number): void;
}
export interface HistoryPort {
  push(index: number): void;
}
export interface FocusPort {
  focusTitle(index: number, visible: boolean): void;
}
export interface ScrollPort {
  beforeSlide(from: number, to: number, fromRest: boolean): void;
  afterLand(index: number): void;
}
export interface SlideStartEvent {
  readonly from: number;
  readonly to: number;
  readonly source: Source;
}
export interface PagerSignals {
  onSlideStart(listener: (e: SlideStartEvent) => void): () => void;
  onLanded(listener: (index: number) => void): () => void;
}
export interface PagerDeps {
  readonly animator: Animator;
  readonly history: HistoryPort;
  readonly focus: FocusPort;
  readonly scroll: ScrollPort;
  readonly commit: (fn: () => void) => void; // flushSync in the browser, direct call in tests
  readonly now: () => number;
}
export interface PagerController {
  getSnapshot(): PagerState;
  subscribe(listener: () => void): () => void;
  intent(intent: Intent): boolean; // true when accepted
  setReducedMotion(reduced: boolean): void;
  isReducedMotion(): boolean;
  readonly signals: PagerSignals;
}
/** DOM hooks shared by the animator (04-06), the provider (04-08) and the chrome (04-09). */
export const PAGER_SELECTORS = {
  track: "main#content",
  bar: '[data-pager="bar"]',
  letters: 'nav[data-pager="letters"]',
} as const;
