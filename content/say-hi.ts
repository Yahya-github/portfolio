import { site } from "./site";
import type { SayHiContent } from "./types";

export const sayHi = {
  title: "Say hi",
  lines: [
    {
      label: "Email",
      href: `mailto:${site.contact.email}`,
      external: false,
      copies: true,
    },
    {
      label: "LinkedIn",
      href: site.contact.linkedin,
      external: true,
      copies: false,
    },
    {
      label: "GitHub",
      href: site.contact.github,
      external: true,
      copies: false,
    },
    {
      label: site.resume.label,
      href: site.resume.href,
      external: false,
      copies: false,
    },
  ],
  address: { label: site.contact.email, href: `mailto:${site.contact.email}` },
  copy: {
    copied: "Copied {address}",
    failed: "Copy didn't work. The address is {address}, select it to copy.",
    description: "Copies the address",
    cursorTag: "Copy the address",
  },
  spiralWord: "say hi",
} as const satisfies SayHiContent;
