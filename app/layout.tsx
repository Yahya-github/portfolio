import { OPENING_SCRIPT } from "@/lib/first-visit/script";
import { JS_FLAG_SCRIPT } from "@/lib/js-flag";
import { rootMetadata } from "@/lib/metadata";
import { personJsonLd, serialiseJsonLd } from "@/lib/structured-data";
import { instrumentSans } from "./fonts";
import "@/styles/tokens.css";
import "@/styles/base.css";

export const metadata = rootMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={instrumentSans.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: OPENING_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(personJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
