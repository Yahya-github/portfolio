/** A pure hold decision, no DOM, no clock (CONT-11; RESEARCH Pattern 2). */
export interface HoldInputs {
  readonly onFrame: boolean;
  readonly onControl: boolean;
  readonly touchHold: boolean;
  readonly keyFocus: boolean;
  readonly userPaused: boolean;
  readonly isCurrentPage: boolean;
  readonly inView: boolean;
  readonly tabHidden: boolean;
  readonly reduced: boolean;
}

/** The visitor is deliberately holding the walkthrough. */
export const engaged = (i: HoldInputs): boolean =>
  i.onFrame || i.onControl || i.touchHold || i.keyFocus;

/** The clock runs only when nothing holds it. */
export const running = (i: HoldInputs): boolean =>
  !i.reduced &&
  !i.userPaused &&
  !engaged(i) &&
  i.inView &&
  i.isCurrentPage &&
  !i.tabHidden;

/** Pause and colour are one condition (DSGN-05), but only on the current page. */
export const showColour = (i: HoldInputs): boolean =>
  engaged(i) && i.isCurrentPage;
