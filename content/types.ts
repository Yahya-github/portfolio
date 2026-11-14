export type Slug =
  "index" | "achievements" | "projects" | "experience" | "about" | "say-hi";

export type Route = "/" | `/${string}/`;

export type Letter = "Y" | "A" | "H";

export interface Section {
  readonly slug: Slug;
  readonly route: Route;
  readonly letter: Letter | null;
  readonly number: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
}

export type MarkName =
  "mame" | "mercor" | "facturo" | "crc" | "mcgill-robotics" | "gdg" | "icpc";

export type ProofPhoto =
  | "diro-hackathon-2026-award"
  | "game-competition-2026-team"
  | "club-of-the-year-award"
  | "crc-2026-trophies";

export type FacturoFrame =
  | "facturo-01-accueil"
  | "facturo-02-historique"
  | "facturo-03-nouvelle-facture"
  | "facturo-04-paiements"
  | "facturo-05-parametres"
  | "facturo-06-palette"
  | "facturo-07-accueil-sombre"
  | "facturo-08-menu-reduit"
  | "facturo-09-mobile"
  | "facturo-10-clients";

export type ProofPreview =
  | {
      readonly kind: "photo";
      readonly photo: ProofPhoto;
      readonly alt: string;
      readonly caption: readonly [string, string];
    }
  | {
      readonly kind: "text";
      readonly caption: readonly [string, string];
    };

export interface LabelledLink {
  readonly label: string;
  readonly href: string;
}

export interface Site {
  readonly origin: string;
  readonly name: string;
  readonly roleLine: string;
  readonly skipLabel: string;
  readonly navLabel: string;
  readonly headerNavLabel: string;
  readonly indexHeaderLabel: string;
  readonly resume: LabelledLink;
  readonly footer: {
    readonly nextPrefix: string;
    readonly backToStart: string;
    readonly counterSeparator: string;
  };
  readonly hint: { readonly fine: string; readonly coarse: string };
  readonly liveRegion: { readonly template: string };
  readonly debug: {
    readonly index: string;
    readonly phase: string;
    readonly source: string;
    readonly wheel: string;
    readonly accum: string;
    readonly gesture: string;
    readonly edge: string;
    readonly swipe: string;
    readonly motion: string;
  };
  readonly motion: { readonly pause: string; readonly play: string };
  readonly contact: {
    readonly email: string;
    readonly linkedin: string;
    readonly github: string;
  };
  readonly shareCardAlt: string;
  readonly person: {
    readonly jobTitle: string;
    readonly affiliation: string;
  };
}

export interface NotFoundContent {
  readonly display: string;
  readonly headingRest: string;
  readonly line: string;
  readonly headerLabel: string;
  readonly metaTitle: string;
}

export interface IndexContent {
  readonly title: string;
  readonly metaLabels: readonly [string, string, string];
  readonly landscapeHint: string;
}

export interface AchievementLine {
  readonly rank: string;
  readonly result: string;
  readonly detail: string;
  readonly href: string | null;
  readonly accentRank: boolean;
  readonly preview: ProofPreview;
  readonly cursorTag: string | null;
}

export interface AchievementsContent {
  readonly title: string;
  readonly titleRows: readonly string[];
  readonly lines: readonly AchievementLine[];
}

export interface ProjectRow {
  readonly number: string;
  readonly name: string;
  readonly link: LabelledLink | null;
  readonly lines: readonly [string, string, string];
  readonly mark: MarkName | null;
  readonly preview: {
    readonly image: "mame-05-admin-overview";
    readonly alt: string;
    readonly caption: readonly [string, string];
  } | null;
  readonly linkCursorTag: string | null;
  /** Internal same-tab link to the row's deep dive (Atlantis, Robot firmware). */
  readonly dive: LabelledLink | null;
  /** Custom cursor tag shown over the dive link. */
  readonly diveCursorTag: string | null;
}

export interface WalkthroughContent {
  readonly roleDescription: string;
  readonly groupLabel: string;
  readonly frames: readonly {
    readonly frame: FacturoFrame;
    readonly name: string;
    readonly alt: string;
  }[];
  readonly controls: {
    readonly pause: string;
    readonly pauseName: string;
    readonly play: string;
    readonly playName: string;
    readonly previous: string;
    readonly previousName: string;
    readonly next: string;
    readonly nextName: string;
  };
  readonly counterTemplate: string;
  readonly statusTemplate: string;
}

export interface ProjectsContent {
  readonly title: string;
  readonly flagship: {
    readonly name: string;
    readonly lines: readonly [string, string];
    readonly imageAlt: string;
    readonly deepDive: LabelledLink;
    readonly walkthrough: WalkthroughContent;
  };
  readonly rows: readonly ProjectRow[];
}

export interface WorkRow {
  readonly date: string;
  readonly role: string;
  readonly organisation: string;
  readonly ended: boolean;
  readonly mark: MarkName | null;
}

export interface InvolvementRow {
  readonly role: string;
  readonly organisation: string;
  readonly mark: MarkName | null;
}

export interface ExperienceContent {
  readonly title: string;
  readonly workHead: string;
  readonly involvementHead: string;
  readonly work: readonly WorkRow[];
  readonly involvement: readonly InvolvementRow[];
}

export interface AboutContent {
  readonly title: string;
  readonly titleRows: readonly string[];
  readonly lead: string;
  readonly paragraph: string;
  /** Words inside `paragraph` rendered as external links, in text order. */
  readonly paragraphLinks: readonly {
    readonly text: string;
    readonly href: string;
  }[];
  readonly portraitAlt: string;
  readonly portraitToggleSuffix: string;
}

export interface SayHiLine {
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
  readonly copies: boolean;
}

export interface SayHiContent {
  readonly title: string;
  readonly lines: readonly SayHiLine[];
  readonly address: LabelledLink;
  readonly copy: {
    readonly copied: string;
    readonly failed: string;
    readonly description: string;
    readonly cursorTag: string;
  };
  readonly spiralWord: string;
}

export interface DeepDiveImage {
  readonly frame: FacturoFrame;
  readonly alt: string;
}

export interface DeepDiveSection {
  readonly id: "problem" | "built" | "result";
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly images: readonly DeepDiveImage[];
}

export interface DeepDiveLink {
  readonly label: string;
  readonly href: string;
  readonly source: string | null;
  readonly external: boolean;
}

export interface FacturoDeepDiveContent {
  readonly route: "/projects/facturo/";
  readonly title: string;
  readonly headerLabel: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly lead: string;
  readonly meta: readonly [string, string, string];
  readonly sections: readonly [
    DeepDiveSection,
    DeepDiveSection,
    DeepDiveSection,
  ];
  readonly links: {
    readonly heading: string;
    readonly items: readonly DeepDiveLink[];
  };
  readonly backLabel: string;
}

export type ProofClearance = "pending" | "cleared" | "withheld";

export interface ProofGate {
  readonly atlantis: {
    readonly clearance: ProofClearance;
    readonly embed: boolean;
  };
  readonly robot: { readonly clearance: ProofClearance };
}

export type DiveProject = "facturo" | "atlantis" | "robot";

export interface AtlantisBuild {
  readonly version: string;
  readonly path: string;
  readonly wasmRaw: number;
  readonly wasmGzip: number;
  readonly wasmBrotli5: number;
  readonly pck: number;
  readonly jsGzip: number;
  readonly totalBytes: number;
  /** One-decimal string shown in the size line; MB = 1,000,000 bytes. */
  readonly totalMB: string;
}

export interface RobotModel {
  readonly version: string;
  readonly src: string;
  readonly placeholder: boolean;
  readonly triangles: number;
  readonly vertices: number;
  readonly bytes: number;
  readonly gzipBytes: number;
}

/** Colour keys exist only for the PICTURES=colour alternative. */
export type ProofMediaKey =
  | "atlantis/atlantis-01-grey"
  | "atlantis/atlantis-02-grey"
  | "atlantis/atlantis-03-grey"
  | "atlantis/atlantis-01"
  | "atlantis/atlantis-02"
  | "atlantis/atlantis-03"
  | "robot/robot-still-grey"
  | "robot/robot-still"
  | "achievements/game-competition-2026-team-grey"
  | "achievements/game-competition-2026-team"
  | "achievements/crc-2026-trophies-grey"
  | "achievements/crc-2026-trophies";

export interface ProofImage {
  readonly key: ProofMediaKey;
  readonly alt: string;
  readonly caption: string | null;
}

export interface ProofRouteContent<R extends string> {
  readonly route: R;
  readonly project: DiveProject;
  readonly title: string;
  readonly titleWords: readonly string[];
  readonly headerLabel: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly lines: readonly [string, string, string];
  readonly meta: readonly string[];
  readonly gallery: readonly ProofImage[];
  readonly links: readonly DeepDiveLink[];
  readonly backLabel: string;
}

/** `{size}` in sizeLine and `{nn}` in loadingPct are substituted at render time. */
export interface GameCopy {
  readonly play: string;
  readonly sizeLine: string;
  readonly loading: string;
  readonly loadingPct: string;
  readonly running: string;
  readonly exit: string;
  readonly mute: string;
  readonly unmute: string;
  readonly muteName: string;
  readonly unmuteName: string;
  readonly escHint: string;
  readonly touchFallback: string;
  readonly noscript: string;
  readonly loadError: string;
  readonly retry: string;
  readonly cannotRun: string;
  readonly frameTitle: string;
  readonly posterCursorTag: string;
}

export interface AtlantisContent extends ProofRouteContent<"/projects/atlantis/"> {
  readonly metaDescriptionFallback: string;
  readonly poster: ProofImage;
  readonly game: GameCopy;
  readonly credits: readonly string[];
}

export interface ViewerCopy {
  readonly roleDescription: string;
  readonly groupLabel: string;
  readonly description: string;
  readonly hintDrag: string;
  readonly hintKeys: string;
  readonly reset: string;
}

export interface RobotContent extends ProofRouteContent<"/projects/robot/"> {
  readonly metaDescriptionStill: string;
  readonly still: ProofImage;
  readonly viewer: ViewerCopy;
}
