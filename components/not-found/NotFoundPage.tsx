import frame from "@/components/frame/frame.module.css";
import { notFound } from "@/content/not-found";
import { site } from "@/content/site";
import { NotFoundLetters } from "./NotFoundLetters";
import styles from "./not-found.module.css";

/** On-brand 404 body: giant 404, one plain line, the five letters (D-08). */
export function NotFoundPage() {
  return (
    <div className={`grid ${styles.body}`}>
      <h1 className={`t-display ${styles.display}`}>
        {notFound.display}{" "}
        <span className="visually-hidden">{notFound.headingRest}</span>
      </h1>
      <p className={`t-body measure ${styles.line}`}>{notFound.line}</p>
      <NotFoundLetters />
    </div>
  );
}

/** Lean footer: no counter, hint or progress bar. */
export function NotFoundFooter() {
  return (
    <footer className={`grid t-label ${frame.footer}`}>
      <span className={frame.end}>
        {/* Plain anchor: the opening script must run on a full load of "/". */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className={frame.next} href="/">
          {site.footer.backToStart}
        </a>
      </span>
    </footer>
  );
}
