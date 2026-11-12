import type { Metadata } from "next";
import { StandaloneClient } from "@/components/deep-dive/StandaloneClient";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import {
  NotFoundFooter,
  NotFoundPage,
} from "@/components/not-found/NotFoundPage";
import styles from "@/components/not-found/not-found.module.css";
import { notFound } from "@/content/not-found";
import { notFoundMetadata } from "@/lib/metadata";

export const metadata: Metadata = notFoundMetadata();

/** Static 404 outside the pager (D-08); exported as out/404.html. */
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <Header current="index" label={notFound.headerLabel} />
      <main id="content" tabIndex={-1} className={styles.main}>
        <NotFoundPage />
      </main>
      <NotFoundFooter />
      <StandaloneClient />
    </>
  );
}
