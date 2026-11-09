"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PageLevel = 1 | 2;

const PageLevelContext = createContext<PageLevel>(1);

interface PageLevelProviderProps {
  readonly level: PageLevel;
  readonly children: ReactNode;
}

/**
 * Heading level of a page's title (A11Y-01): 1 for the pager target, 2
 * elsewhere. A client context so server page bodies never re-render when the
 * target changes (RESEARCH Pattern 1).
 */
export function PageLevelProvider({ level, children }: PageLevelProviderProps) {
  return <PageLevelContext value={level}>{children}</PageLevelContext>;
}

export function usePageLevel(): PageLevel {
  return useContext(PageLevelContext);
}
