// Test stand-in for godot/shell/shell.js: same postMessage protocol, no Engine.
const ORIGIN = location.origin;
const post = (msg) => parent.postMessage(msg, ORIGIN);
const failing = document.currentScript.dataset.mode === "error";
const PROGRESS_MS = 50;
const READY_MS = 150;

addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      post({ type: "escape" });
    } else if (e.key === "x") {
      post({ type: "exit" });
    }
  },
  true,
);

addEventListener("message", (e) => {
  if (e.origin !== ORIGIN || e.source !== parent) return;
  const data = e.data;
  if (!data || data.type !== "mute" || typeof data.value !== "boolean") return;
  document.body.dataset.muted = String(data.value);
});

if (failing) {
  post({ type: "error" });
} else {
  post({ type: "progress", cur: 0, total: 100 });
  setTimeout(
    () => post({ type: "progress", cur: 50, total: 100 }),
    PROGRESS_MS,
  );
  setTimeout(() => {
    post({ type: "progress", cur: 100, total: 100 });
    document.getElementById("canvas").focus();
    post({ type: "ready" });
  }, READY_MS);
}
