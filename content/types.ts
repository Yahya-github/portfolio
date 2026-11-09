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
  readonly contact: {
    readonly email: string;
    readonly linkedin: string;
    readonly github: string;
  };
}

export interface IndexContent {
  readonly title: string;
  readonly metaLabels: readonly [string, string, string];
}

export interface AchievementLine {
  readonly rank: string;
  readonly result: string;
  readonly detail: string;
  readonly href: string | null;
  readonly accentRank: boolean;
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
}

export interface ProjectsContent {
  readonly title: string;
  readonly flagship: {
    readonly name: string;
    readonly lines: readonly [string, string];
    readonly imageAlt: string;
  };
  readonly rows: readonly ProjectRow[];
}

export interface WorkRow {
  readonly date: string;
  readonly role: string;
  readonly organisation: string;
  readonly ended: boolean;
}

export interface InvolvementRow {
  readonly role: string;
  readonly organisation: string;
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
}

export interface SayHiLine {
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
}

export interface SayHiContent {
  readonly title: string;
  readonly lines: readonly SayHiLine[];
  readonly address: LabelledLink;
}
