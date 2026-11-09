/**
 * Phone Display fit (user decision 1, 2026-11-08). Each word's width in em,
 * measured at wdth 75 / weight 700 / letter-spacing -0.05em (RESEARCH Pitfall 4).
 *
 * Consumers set `style={displayFitStyle(word) as CSSProperties}` and, at
 * max-width 820px, use
 * `font-size: min(var(--text-display-phone), calc((100vw - var(--phone-inset)) / var(--word-em)));`
 */
export const DEFAULT_WORD_EM = 4.6;

export const DISPLAY_WORD_EM: Readonly<Record<string, number>> = {
  Achievements: 4.53,
  "Resume (PDF)": 4.49,
  Involvement: 3.98,
  LinkedIn: 2.69,
  Facturo: 2.36,
  GitHub: 2.19,
  Email: 1.72,
  Work: 1.67,
  TWO: 1.49,
};

export function displayFitStyle(word: string): {
  readonly "--word-em": number;
} {
  return { "--word-em": DISPLAY_WORD_EM[word] ?? DEFAULT_WORD_EM };
}
