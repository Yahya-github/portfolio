import { projects } from "./projects";
import type {
  DeepDiveImage,
  FacturoDeepDiveContent,
  FacturoFrame,
} from "./types";

const altOf = (frame: FacturoFrame): DeepDiveImage => {
  const found = projects.flagship.walkthrough.frames.find(
    (f) => f.frame === frame,
  );
  if (!found) throw new Error(`Unknown Facturo frame: ${frame}`);
  return { frame, alt: found.alt };
};

export const facturo = {
  route: "/projects/facturo/",
  title: "Facturo",
  headerLabel: "02.1 Facturo",
  metaTitle: "Facturo, Yahya Hallani",
  metaDescription:
    "Facturo, a local-first invoicing app for a Quebec trucking company: paper tickets to tax-correct invoices, with more than 700 tests.",
  lead: "A local-first invoicing app for a Quebec trucking company, from paper tickets to tax-correct invoices.",
  meta: ["Developer", "Jun 2026 to Oct 2026", "For a Quebec trucking company"],
  sections: [
    {
      id: "problem",
      heading: "Problem",
      paragraphs: [
        "The company worked from paper tickets. Each one had to become a tax-correct invoice, with TPS and TVQ, in Excel and PDF. Supplier payments had to be reconciled too.",
      ],
      images: [altOf("facturo-01-accueil")],
    },
    {
      id: "built",
      heading: "What I built",
      paragraphs: [
        "A local-first app that turns tickets into invoices with TPS and TVQ, exports them to Excel and PDF, and reconciles supplier payments.",
        "Handwritten tickets are read by a local vision model. Misreads are snapped by edit distance, and a field the model is unsure of is left blank instead of guessed.",
        "Releases are built with GitHub Actions and PyInstaller. In-app updates are verified with SHA-256 and can roll back.",
      ],
      images: [
        altOf("facturo-03-nouvelle-facture"),
        altOf("facturo-04-paiements"),
        altOf("facturo-09-mobile"),
      ],
    },
    {
      id: "result",
      heading: "Result",
      paragraphs: [
        "More than 700 tests. The client's project is private; a public demo with fictional data shows the app.",
      ],
      images: [altOf("facturo-02-historique")],
    },
  ],
  links: {
    heading: "Links",
    items: [
      {
        label: "Demo repo",
        href: "https://github.com/Yahya-github/facturo-demo",
        source: "GitHub, fictional data",
        external: true,
      },
      {
        label: "Back to Projects",
        href: "/projects/",
        source: null,
        external: false,
      },
    ],
  },
  backLabel: "Back to Projects",
} as const satisfies FacturoDeepDiveContent;
