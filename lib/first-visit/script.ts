import { OPENING_KEY } from "@/lib/first-visit/storage";

/** Pitfall 7: a still-pending opening is revealed if the bundle never claims it. */
export const OPENING_FAILSAFE_MS = 3000;

/**
 * EXP-01 / D-02 / D-05: before first paint, hide the letters and chrome only for a
 * first view of the Index. Build-time constant (T-05-09): only the storage key and a
 * numeric constant are interpolated. Code, not copy.
 */
export const OPENING_SCRIPT = `try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&localStorage.getItem(${JSON.stringify(OPENING_KEY)})===null){var d=document.documentElement;d.dataset.opening="pending";setTimeout(function(){if(d.dataset.opening==="pending")delete d.dataset.opening},${OPENING_FAILSAFE_MS})}}catch(e){}`;
