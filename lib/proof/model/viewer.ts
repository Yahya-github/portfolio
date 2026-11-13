/**
 * Robot WebGL2 viewer (PROOF-02; D-11, D-13, D-14). Lazy and React-free.
 * Raw WebGL2, one Lambert pass, no libraries. The still stays under the canvas
 * and is restored on any failure, so no path here logs anything.
 * Input: mouse/pen drag (yaw + pitch), touch drag (yaw only, horizontal-first so
 * vertical swipes scroll the page), arrow keys, Home and Reset view. The page
 * always scrolls freely. Auto-rotate is gated by shouldAutoRotate.
 */
import { cubicBezier, parseCubicBezier } from "./ease";
import { parseMesh, type ParsedMesh } from "./mesh-format";
import {
  PITCH_LIMIT,
  START_POSE,
  autoRotateYaw,
  dragTo,
  keyStep,
  shouldAutoRotate,
  touchIntent,
  type Pose,
} from "./orbit";

const LOST_EVENT = "webglcontextlost";
const FOV = (30 * Math.PI) / 180;
const TURN_FALLBACK_MS = 24000;
const MAX_DPR = 2;
const MAX_DT_MS = 100;
const TAU = Math.PI * 2;
const GROUND_FALLBACK: readonly [number, number, number] = [11, 11, 11];

const VERT = `#version 300 es
layout(location = 0) in vec4 aPos;
layout(location = 1) in vec4 aNrm;
uniform vec3 uMin;
uniform vec3 uMax;
uniform vec2 uYawPitch;
uniform vec2 uScale;
uniform vec3 uDepth;
out vec3 vN;
vec3 rot(vec3 v) {
  float cy = cos(uYawPitch.x), sy = sin(uYawPitch.x);
  float cp = cos(uYawPitch.y), sp = sin(uYawPitch.y);
  vec3 a = vec3(cy * v.x + sy * v.z, v.y, -sy * v.x + cy * v.z);
  return vec3(a.x, cp * a.y - sp * a.z, sp * a.y + cp * a.z);
}
void main() {
  vec3 p = uMin + (aPos.xyz + 1.0) * 0.5 * (uMax - uMin);
  vec3 c = rot(p - (uMin + uMax) * 0.5);
  vN = rot(aNrm.xyz);
  float z = c.z - uDepth.x;
  float near = uDepth.y, far = uDepth.z;
  gl_Position = vec4(
    c.x * uScale.x,
    c.y * uScale.y,
    (z * (far + near) + 2.0 * far * near) / (near - far),
    -z
  );
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec3 vN;
uniform vec3 uLight;
out vec4 outColor;
void main() {
  float l = max(dot(normalize(vN), uLight), 0.0);
  outColor = vec4(vec3(mix(0.290, 0.878, l)), 1.0);
}`;

interface Renderer {
  draw(pose: Pose, width: number, height: number): void;
  dispose(): void;
}

function readToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function tokenMs(name: string, fallback: number): number {
  const raw = readToken(name);
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return raw.endsWith("ms") ? n : raw.endsWith("s") ? n * 1000 : fallback;
}

function tokenEase(name: string): (t: number) => number {
  const args = parseCubicBezier(readToken(name));
  return args ? cubicBezier(...args) : (t) => t;
}

function groundColor(): readonly [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(readToken("--color-ground"));
  if (!m) return GROUND_FALLBACK;
  const v = Number.parseInt(m[1], 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error("compile");
  }
  return shader;
}

function link(gl: WebGL2RenderingContext): WebGLProgram {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!program) throw new Error("program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    throw new Error("link");
  }
  return program;
}

function uploadMesh(
  gl: WebGL2RenderingContext,
  mesh: ParsedMesh,
): { vao: WebGLVertexArrayObject; buffers: WebGLBuffer[] } {
  const vao = gl.createVertexArray();
  const pos = gl.createBuffer();
  const nrm = gl.createBuffer();
  const idx = gl.createBuffer();
  if (!vao || !pos || !nrm || !idx) throw new Error("buffers");
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.SHORT, true, 8, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, nrm);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.BYTE, true, 4, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
  return { vao, buffers: [pos, nrm, idx] };
}

function setupGl(gl: WebGL2RenderingContext, mesh: ParsedMesh): Renderer {
  const program = link(gl);
  const { vao, buffers } = uploadMesh(gl, mesh);
  const u = (n: string) => gl.getUniformLocation(program, n);
  const [lo, hi] = [mesh.bboxMin, mesh.bboxMax];
  const radius =
    Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2 || 1;
  const f = 1 / Math.tan(FOV / 2);
  const elementType =
    mesh.indexType === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
  const [r, g, b] = groundColor();
  const lightYaw = (-45 * Math.PI) / 180;
  const lightUp = (35 * Math.PI) / 180;
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(r / 255, g / 255, b / 255, 1);
  return {
    draw(pose, width, height) {
      const aspect = width / Math.max(height, 1);
      const dist = (radius / Math.sin(FOV / 2)) * Math.max(1, 1 / aspect);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform3f(u("uMin"), lo[0], lo[1], lo[2]);
      gl.uniform3f(u("uMax"), hi[0], hi[1], hi[2]);
      gl.uniform2f(u("uYawPitch"), pose.yaw, pose.pitch);
      gl.uniform2f(u("uScale"), f / aspect, f);
      gl.uniform3f(
        u("uDepth"),
        -dist,
        Math.max(dist - radius * 1.2, 0.01),
        dist + radius * 1.2,
      );
      gl.uniform3f(
        u("uLight"),
        Math.sin(lightYaw) * Math.cos(lightUp),
        Math.sin(lightUp),
        Math.cos(lightYaw) * Math.cos(lightUp),
      );
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, mesh.indexCount, elementType, 0);
    },
    dispose() {
      gl.deleteVertexArray(vao);
      for (const buf of buffers) gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    },
  };
}

async function loadMesh(src: string): Promise<ParsedMesh | null> {
  const res = await fetch(src);
  if (!res.ok) return null;
  return parseMesh(await res.arrayBuffer());
}

/** Signed shortest yaw delta so Reset never spins the long way round. */
function shortestTo(from: Pose, to: Pose): Pose {
  const d = (((to.yaw - from.yaw) % TAU) + TAU + Math.PI) % TAU;
  return { yaw: from.yaw + d - Math.PI, pitch: to.pitch };
}

const clampPitch = (p: number): number =>
  Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, p));

export async function mount(figure: HTMLElement): Promise<() => void> {
  const noop = (): void => {};
  const src = figure.dataset.modelSrc;
  const slot = figure.querySelector<HTMLElement>("[data-model-slot]");
  if (!src || !slot) return noop;
  try {
    const mesh = await loadMesh(src);
    if (!mesh || !figure.isConnected) return noop;
    return start(figure, slot, mesh);
  } catch {
    return noop;
  }
}

function start(
  figure: HTMLElement,
  slot: HTMLElement,
  mesh: ParsedMesh,
): () => void {
  const noop = (): void => {};
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
  if (!gl) return noop;
  let renderer: Renderer;
  try {
    renderer = setupGl(gl, mesh);
  } catch {
    return noop;
  }
  const html = document.documentElement;
  const still = figure.querySelector<HTMLElement>("[data-model-still]");
  const hint = figure.querySelector<HTMLElement>("[data-model-hint]");
  const reset = figure.querySelector<HTMLElement>(
    '[data-model-action="reset"]',
  );
  const copy = readCopy(figure);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const flags = { inView: true, touched: false };
  const turnMs = tokenMs("--model-turn", TURN_FALLBACK_MS);
  let pose: Pose = START_POSE;
  let anim: {
    from: Pose;
    to: Pose;
    t0: number;
    ms: number;
    ease: (t: number) => number;
  } | null = null;
  let raf = 0;
  let last = 0;
  let disposed = false;
  let fadeTimer = 0;

  const draw = (): void => renderer.draw(pose, canvas.width, canvas.height);
  const autoOn = (): boolean =>
    shouldAutoRotate({
      reducedMotion: reduce.matches,
      motionOn: html.dataset.motion !== "off",
      inView: flags.inView,
      visible: !document.hidden,
      touched: flags.touched,
    });
  const frame = (now: number): void => {
    raf = 0;
    const dt = last ? Math.min(now - last, MAX_DT_MS) : 0;
    last = now;
    if (anim) {
      const k = (now - anim.t0) / anim.ms;
      pose = k >= 1 ? anim.to : lerpPose(anim.from, anim.to, anim.ease(k));
      if (k >= 1) anim = null;
    } else if (autoOn()) {
      pose = autoRotateYaw(pose, dt, turnMs);
    }
    draw();
    if (anim || autoOn()) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const kick = (): void => {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  };
  const touch = (): void => {
    if (flags.touched) return;
    flags.touched = true;
    html.dataset.modelTouched = "";
  };
  const animateTo = (to: Pose, durToken: string, easeToken: string): void => {
    const ms = reduce.matches ? 0 : tokenMs(durToken, 0);
    if (ms <= 0) {
      anim = null;
      pose = to;
      draw();
      return;
    }
    anim = {
      from: pose,
      to,
      t0: performance.now(),
      ms,
      ease: tokenEase(easeToken),
    };
    kick();
  };
  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = Math.max(1, Math.round(slot.clientWidth * dpr));
    const h = Math.max(1, Math.round(slot.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    draw();
  };

  const drag = bindPointer(canvas, {
    getPose: () => pose,
    setPose: (p) => {
      anim = null;
      pose = p;
      draw();
    },
    touch,
  });
  const onKey = (e: KeyboardEvent): void => {
    if (e.target !== figure || e.altKey || e.ctrlKey || e.metaKey) return;
    const next = keyStep(pose, e.key);
    if (!next) return;
    e.preventDefault();
    touch();
    if (e.key === "Home") {
      animateTo(shortestTo(pose, START_POSE), "--dur-page", "--ease-page");
    } else {
      animateTo(next, "--dur-ui", "--ease-ui");
    }
  };
  const onReset = (): void => {
    touch();
    animateTo(shortestTo(pose, START_POSE), "--dur-page", "--ease-page");
  };
  const setHint = (text: string): void => {
    if (hint) hint.textContent = text;
  };
  const onFocus = (): void => setHint(copy.hintKeys);
  const onBlur = (): void => setHint(copy.hintDrag);
  const onLost = (e: Event): void => {
    e.preventDefault();
    restore();
  };

  const io = new IntersectionObserver((entries) => {
    flags.inView = entries[entries.length - 1]?.isIntersecting ?? true;
    kick();
  });
  const mo = new MutationObserver(kick);
  const ro = new ResizeObserver(resize);
  const onVisibility = (): void => kick();

  function restore(): void {
    window.clearTimeout(fadeTimer);
    canvas.remove();
    if (still) still.style.visibility = "";
    delete figure.dataset.modelState;
    for (const a of [
      "role",
      "aria-roledescription",
      "aria-label",
      "aria-describedby",
      "tabindex",
    ]) {
      figure.removeAttribute(a);
    }
    setHint(copy.hintDrag);
  }

  slot.appendChild(canvas);
  resize();
  figure.dataset.modelState = "live";
  figure.setAttribute("role", "group");
  figure.setAttribute("aria-roledescription", copy.roleDescription);
  figure.setAttribute("aria-label", copy.groupLabel);
  figure.setAttribute("aria-describedby", "robot-viewer-desc");
  figure.setAttribute("tabindex", "0");
  fadeTimer = window.setTimeout(
    () => {
      if (still) still.style.visibility = "hidden";
    },
    reduce.matches ? 0 : tokenMs("--dur-fade", 0),
  );

  figure.addEventListener("keydown", onKey);
  figure.addEventListener("focus", onFocus);
  figure.addEventListener("blur", onBlur);
  reset?.addEventListener("click", onReset);
  canvas.addEventListener(LOST_EVENT, onLost);
  document.addEventListener("visibilitychange", onVisibility);
  reduce.addEventListener("change", kick);
  mo.observe(html, { attributes: true, attributeFilter: ["data-motion"] });
  io.observe(figure);
  ro.observe(slot);
  kick();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    mo.disconnect();
    ro.disconnect();
    drag();
    figure.removeEventListener("keydown", onKey);
    figure.removeEventListener("focus", onFocus);
    figure.removeEventListener("blur", onBlur);
    reset?.removeEventListener("click", onReset);
    canvas.removeEventListener(LOST_EVENT, onLost);
    document.removeEventListener("visibilitychange", onVisibility);
    reduce.removeEventListener("change", kick);
    renderer.dispose();
    restore();
  };
}

function lerpPose(a: Pose, b: Pose, k: number): Pose {
  return {
    yaw: a.yaw + (b.yaw - a.yaw) * k,
    pitch: a.pitch + (b.pitch - a.pitch) * k,
  };
}

interface ViewerCopy {
  readonly roleDescription: string;
  readonly groupLabel: string;
  readonly hintDrag: string;
  readonly hintKeys: string;
}

/** Viewer copy lives in content/robot.ts; the server markup carries the drag hint. */
function readCopy(figure: HTMLElement): ViewerCopy {
  const hintDrag =
    figure.querySelector("[data-model-hint]")?.textContent ?? "Drag to rotate";
  return {
    roleDescription: "3D viewer",
    groupLabel: "CRC 2026 robot, 3D model",
    hintDrag,
    hintKeys: "Arrow keys rotate",
  };
}

interface PointerHooks {
  getPose(): Pose;
  setPose(p: Pose): void;
  touch(): void;
}

/** Pointer drag with touch intent detection; returns the unbind function. */
function bindPointer(
  canvas: HTMLCanvasElement,
  hooks: PointerHooks,
): () => void {
  let id = -1;
  let type = "mouse";
  let origin = { x: 0, y: 0 };
  let prev = { x: 0, y: 0 };
  let intent: "orbit" | "scroll" | null = null;

  const end = (): void => {
    id = -1;
  };
  const down = (e: PointerEvent): void => {
    if (id !== -1 || (e.pointerType === "mouse" && e.button !== 0)) return;
    id = e.pointerId;
    type = e.pointerType;
    origin = prev = { x: e.clientX, y: e.clientY };
    intent = type === "touch" ? null : "orbit";
    hooks.touch();
    if (intent) canvas.setPointerCapture(id);
  };
  const move = (e: PointerEvent): void => {
    if (e.pointerId !== id) return;
    if (type === "touch" && intent === null) {
      intent = touchIntent(e.clientX - origin.x, e.clientY - origin.y);
      if (intent === "scroll") return end();
      if (intent === "orbit") canvas.setPointerCapture(id);
    }
    if (intent !== "orbit") return;
    const rect = canvas.getBoundingClientRect();
    const next = dragTo(
      hooks.getPose(),
      e.clientX - prev.x,
      e.clientY - prev.y,
      rect.width,
      type !== "touch",
    );
    prev = { x: e.clientX, y: e.clientY };
    hooks.setPose({ yaw: next.yaw, pitch: clampPitch(next.pitch) });
  };
  const up = (e: PointerEvent): void => {
    if (e.pointerId === id) end();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  return () => {
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
  };
}
