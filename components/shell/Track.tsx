import type { ComponentType, CSSProperties } from "react";
import { AboutPage } from "@/components/pages/AboutPage";
import { AchievementsPage } from "@/components/pages/AchievementsPage";
import { ExperiencePage } from "@/components/pages/ExperiencePage";
import { IndexPage } from "@/components/pages/IndexPage";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { SayHiPage } from "@/components/pages/SayHiPage";
import type { PageProps } from "@/components/pages/types";
import { sections } from "@/content/site";
import type { Slug } from "@/content/types";
import { indexOfSlug } from "@/lib/sections";
import { PageSection } from "./PageSection";
import styles from "./shell.module.css";

const PAGE_COMPONENTS: Readonly<Record<Slug, ComponentType<PageProps>>> = {
  index: IndexPage,
  achievements: AchievementsPage,
  projects: ProjectsPage,
  experience: ExperiencePage,
  about: AboutPage,
  "say-hi": SayHiPage,
};

interface TrackProps {
  readonly current: Slug;
}

/**
 * All six pages on every route (D-05). Only the current one is live; the
 * other five are inert and hidden by CSS, so JS-off visitors see one page.
 * PageSection projects pager state (inert, collapse, heading level) live.
 */
export function Track({ current }: TrackProps) {
  return (
    <main
      id="content"
      tabIndex={-1}
      data-current={current}
      className={styles.track}
      style={{ "--track-index": indexOfSlug(current) } as CSSProperties}
    >
      {sections.map((s, i) => {
        const isCurrent = s.slug === current;
        const Body = PAGE_COMPONENTS[s.slug];
        return (
          <PageSection
            key={s.slug}
            index={i}
            slug={s.slug}
            initialIndex={indexOfSlug(current)}
          >
            <Body isCurrent={isCurrent} />
          </PageSection>
        );
      })}
    </main>
  );
}
