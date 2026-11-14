/* global Engine */
// First-party shell for the Atlantis web export. Copied next to play.html by
// scripts/export-atlantis.mjs. Talks to the parent page only through
// same-origin postMessage (T-08-16, T-08-17).
const ORIGIN = location.origin;
const post = (msg) => parent.postMessage(msg, ORIGIN);

// Godot listens on the canvas and preventDefault()s every key; a window capture
// listener runs first, so Esc never reaches the game.
addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopImmediatePropagation();
    post({ type: "escape" });
  },
  true,
);

// Mute bridge: only the same-origin parent may send { type: "mute", value }.
addEventListener("message", (e) => {
  if (e.origin !== ORIGIN || e.source !== parent) return;
  const data = e.data;
  if (!data || data.type !== "mute" || typeof data.value !== "boolean") return;
  if (typeof window.atlantisSetMute === "function") {
    window.atlantisSetMute(data.value);
  }
});

try {
  const config = JSON.parse(
    document.getElementById("godot-config").textContent,
  );
  const engine = new Engine({
    ...config,
    ensureCrossOriginIsolationHeaders: false,
    onProgress: (cur, total) => post({ type: "progress", cur, total }),
    onExit: () => post({ type: "exit" }),
  });
  engine.startGame().then(
    () => post({ type: "ready" }),
    () => post({ type: "error" }),
  );
} catch {
  post({ type: "error" });
}
