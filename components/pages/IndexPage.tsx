import { PageTitle } from "@/components/pages/Heading";
import { indexPage } from "@/content/index";
import { site } from "@/content/site";
import { letterSections } from "@/lib/sections";
import styles from "./index-page.module.css";

/**
 * 00 Index. The giant YAHYA is rendered by LetterNav outside the track
 * (plan 03-05); this page carries the role line, the desktop meta labels and
 * the phone section list.
 */
export function IndexPage() {
  return (
    <div className={`grid ${styles.root}`}>
      <PageTitle slug="index" text={indexPage.title} />
      <div className={styles.intro}>
        <p className="t-body measure">{site.roleLine}</p>
        <ul className={`t-label ${styles.list}`}>
          {letterSections().map((s) => (
            <li key={s.slug}>
              <a href={s.route}>
                <span className="c-dim">{s.number}</span> {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ul className={`t-label c-dim ${styles.meta}`}>
        {indexPage.metaLabels.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
