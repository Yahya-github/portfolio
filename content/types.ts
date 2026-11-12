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
