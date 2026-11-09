import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia and logs "Not implemented" for scrollTo.
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string): MediaQueryList =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    });
  }
  window.scrollTo = (() => {}) as typeof window.scrollTo;
}
