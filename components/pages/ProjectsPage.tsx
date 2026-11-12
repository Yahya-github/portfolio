import type { CSSProperties } from "react";
import { OrgMark } from "@/components/media/OrgMark";
import { ProofPreview } from "@/components/media/ProofPreview";
import { Heading, PageTitle } from "@/components/pages/Heading";
import type { PageProps } from "@/components/pages/types";
import { projects } from "@/content/projects";
import { displayFitStyle } from "@/lib/display-fit";
import { media } from "@/lib/media/manifest";
import { Walkthrough } from "@/components/walkthrough/Walkthrough";
import styles from "./projects-page.module.css";

/**
 * 02 Projects. Facturo walkthrough and lead in cols 1-8, five compact
 * ruled rows in cols 9-12. The walkthrough is lazy (CONT-11).
 */
export function ProjectsPage({ isCurrent }: PageProps) {
  return (
    <div className={`grid ${styles.root}`}>
      <PageTitle
        slug="projects"
        text={projects.title}
        className={styles.title}
      />
      <div className={styles.lead}>
        <Walkthrough isCurrent={isCurrent} />
        <Heading offset={1} className={`t-display ${styles.name}`}>
          <span
            style={displayFitStyle(projects.flagship.name) as CSSProperties}
            className={styles.nameWord}
          >
            {projects.flagship.name}
          </span>
        </Heading>
        <p className={`t-body ${styles.leadLine}`}>
          {projects.flagship.lines[0]}
        </p>
        <p className={`t-body c-dim ${styles.leadLine}`}>
          {projects.flagship.lines[1]}
        </p>
        <a
          className={`t-label ulink ${styles.deep}`}
          href={projects.flagship.deepDive.href}
        >
          {projects.flagship.deepDive.label}
        </a>
      </div>
      <ol className={styles.rows}>
        {projects.rows.map((r) => (
          <li
            key={r.number}
            className={styles.row}
            data-preview-item={r.preview ? "" : undefined}
            data-tap-colour={r.mark ? "" : undefined}
          >
            <div className={styles.head}>
              <span className="t-label c-dim tnum">{r.number}</span>
              <Heading offset={1} className="t-heading">
                {r.name}
              </Heading>
              {r.mark ? (
                <span className={styles.mark}>
                  <OrgMark name={r.mark} eager={isCurrent} />
                </span>
              ) : null}
              {r.link ? (
                <a
                  className={`t-label ulink ${styles.link}`}
                  href={r.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-trigger={r.preview ? "" : undefined}
                  data-cursor-tag={r.linkCursorTag ?? undefined}
                >
                  {r.link.label}
                </a>
              ) : null}
            </div>
            <p className="t-body c-dim">{r.lines[0]}</p>
            <p className={`t-body c-dim ${styles.mid}`}>{r.lines[1]}</p>
            <p className="t-body c-dim">{r.lines[2]}</p>
            {r.preview ? (
              <ProofPreview
                className={styles.mamePreview}
                sizes="(max-width: 820px) 40vw, 17vw"
                preview={{
                  kind: "photo",
                  grey: media[`mame/${r.preview.image}-grey`],
                  colour: media[`mame/${r.preview.image}`],
                  alt: r.preview.alt,
                  caption: r.preview.caption,
                }}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
