import localFont from "next/font/local";

export const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-wdth-wght.woff2",
  weight: "400 700",
  style: "normal",
  display: "block",
  variable: "--font-sans",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
  fallback: ["system-ui", "Arial", "sans-serif"],
});
