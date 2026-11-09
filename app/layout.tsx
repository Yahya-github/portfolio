import { rootMetadata } from "@/lib/metadata";
import { instrumentSans } from "./fonts";
import "@/styles/tokens.css";
import "@/styles/base.css";

export const metadata = rootMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
