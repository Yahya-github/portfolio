import type { Slug } from "@/content/types";
import { sectionBySlug } from "@/lib/sections";
import styles from "./edge-number.module.css";

/**
 * Edge-cropped page number (design doc 4.2 item 3, D-04 device 2): the
 * section number in Display weight and width, sized to the free height under
 * the Involvement table and cut by the page's right edge. Decorative,
 * aria-hidden, pure CSS. It also publishes `--names-end` for the margin names.
 * D-05: remove the single `<EdgeNumber />` line in ExperiencePage.tsx to cut it.
 */
export function EdgeNumber({ slug }: { readonly slug: Slug }) {
  return (
    <span aria-hidden="true" className={`tnum ${styles.edge}`} data-edge-number>
      {sectionBySlug(slug).number}
    </span>
  );
}
