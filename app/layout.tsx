import type { Metadata } from "next";
import { instrumentSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yahya Hallani",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
