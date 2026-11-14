import type { DeepDiveLink } from "@/content/types";
import dive from "@/components/deep-dive/deep-dive.module.css";

interface ProofLinksProps {
  readonly links: readonly DeepDiveLink[];
  readonly className?: string;
}

/** Link list for the lean proof routes (Facturo link markup, D-03). */
export function ProofLinks({ links, className }: ProofLinksProps) {
  return (
    <ul className={className}>
      {links.map((item) => (
        <li key={item.href}>
          <a
            className={`t-heading ulink ${dive.link}`}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
          >
            {item.label}
          </a>
          {item.source ? (
            <span className={`t-label c-dim ${dive.source}`}>
              {item.source}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
