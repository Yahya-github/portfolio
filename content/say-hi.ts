import { site } from "./site";
import type { SayHiContent } from "./types";

export const sayHi = {
  title: "Say hi",
  lines: [
    { label: "Email", href: `mailto:${site.contact.email}`, external: false },
    { label: "LinkedIn", href: site.contact.linkedin, external: true },
    { label: "GitHub", href: site.contact.github, external: true },
    { label: site.resume.label, href: site.resume.href, external: false },
  ],
  address: { label: site.contact.email, href: `mailto:${site.contact.email}` },
} as const satisfies SayHiContent;
