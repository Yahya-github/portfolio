/** The three deep-dive routes that morph from and back to their Projects row (D-17). */
export const DIVE_ROUTES = [
  "/projects/facturo/",
  "/projects/atlantis/",
  "/projects/robot/",
] as const;

export const PROJECTS_ROUTE = "/projects/";

export interface TransitionContext {
  readonly reducedMotion: boolean;
  readonly motionPaused: boolean;
  readonly sourceInView: boolean;
  readonly fromPath: string;
  readonly toPath: string;
}

const isDive = (path: string): boolean =>
  (DIVE_ROUTES as readonly string[]).includes(path);

/** True when the pair is Projects to a deep dive, or a deep dive back to Projects. */
export const isDivePair = (fromPath: string, toPath: string): boolean =>
  fromPath === PROJECTS_ROUTE
    ? isDive(toPath)
    : toPath === PROJECTS_ROUTE && isDive(fromPath);

/** D-19c: the transition plays only with motion allowed, a visible source and a dive pair. */
export function shouldSkipTransition(ctx: TransitionContext): boolean {
  return (
    ctx.reducedMotion ||
    ctx.motionPaused ||
    !ctx.sourceInView ||
    !isDivePair(ctx.fromPath, ctx.toPath)
  );
}
