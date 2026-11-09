"use client";

/**
 * React access to the pager controller (Phase 4). Outside a provider the
 * hooks fall back to a resting state so chrome renders in unit tests and
 * matches the server HTML on first paint.
 */
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { initialState } from "@/lib/pager/state";
import type { PagerController, PagerState } from "@/lib/pager/types";

export const PagerContext = createContext<PagerController | null>(null);

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

export function usePagerController(): PagerController | null {
  return useContext(PagerContext);
}

export function usePagerState(fallbackIndex: number): PagerState {
  const controller = useContext(PagerContext);
  const fallback = useMemo(() => initialState(fallbackIndex), [fallbackIndex]);
  const subscribe = controller ? controller.subscribe : NOOP_SUBSCRIBE;
  const get = controller ? controller.getSnapshot : () => fallback;
  return useSyncExternalStore(subscribe, get, get);
}
