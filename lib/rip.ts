// Geometry and easing for the hero paper rip. Pure functions, no DOM.

/** Torn bottom edge: depth (px) of each tooth, right → left, every 1/30 of the width (from the design canvas). */
export const TEETH = [15, 18, 38, 19, 23, 35, 7, 6, 36, 33, 10, 8, 30, 38, 8, 38, 35, 24, 17, 4, 2, 39, 10, 28, 10, 33, 24, 12, 7, 29, 3];
const toothX = (i: number) => 100 - (i * 100) / 30;

/** Index of the tooth where the rip meets the bottom edge (x = 60%). */
const RIP_TOOTH = 12;
export const RIP_BOTTOM_PX = TEETH[RIP_TOOTH];

/** Rip line, top → bottom, as [x%, y%] of the paper sheet. Deterministic jitter. */
const SEGMENTS = 22;
export const RIP: [number, number][] = Array.from({ length: SEGMENTS + 1 }, (_, k) => {
  const t = k / SEGMENTS;
  const jitter = k === 0 || k === SEGMENTS ? 0 : (Math.sin(k * 91.7) * 1000) % 1; // −1…1
  return [57 + 3 * t + jitter * 1.2, t * 100];
});
export const RIP_TOP_X = RIP[0][0];

// Bottom rip point sits on the torn edge, so its y is `100% - depth`.
const ripY = (k: number) => (k === SEGMENTS ? `calc(100% - ${RIP_BOTTOM_PX}px)` : `${RIP[k][1]}%`);
const teeth = (from: number, to: number) =>
  TEETH.slice(from, to).map((d, j) => `${toothX(from + j).toFixed(2)}% calc(100% - ${d}px)`);

// Each half overlaps the rip by 1px so no anti-aliased seam shows before the tear.
const ripPts = (dx: string) => RIP.map(([x], k) => `calc(${x.toFixed(2)}% ${dx}) ${ripY(k)}`);

export const LEFT_CLIP = `polygon(0% 0%, ${[...ripPts("+ 1px"), ...teeth(RIP_TOOTH + 1, TEETH.length)].join(", ")})`;
// Right half: rip top → top-right corner → torn edge 100%…63% → back up the rip.
export const RIGHT_CLIP = `polygon(${[
  ...ripPts("- 1px").slice(0, 1),
  "100% 0%",
  ...teeth(0, RIP_TOOTH),
  ...ripPts("- 1px").slice(1).reverse(),
].join(", ")})`;

/** Where the tear's tip is once the cut has travelled `cut` (0 = bottom, 1 = top). */
export function tipAt(cut: number): { x: number; y: number } {
  const y = (1 - cut) * 100;
  const k = Math.min(SEGMENTS - 1, Math.floor((y / 100) * SEGMENTS));
  const [x0, y0] = RIP[k];
  const [x1, y1] = RIP[k + 1];
  const u = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
  return { x: x0 + (x1 - x0) * u, y };
}

/** Fibre stroke points for the torn part only (bottom → tip), in the 0–100 viewBox. */
export function fiberPoints(cut: number): string {
  if (cut <= 0) return "";
  const tip = tipAt(cut);
  const below = RIP.filter(([, y]) => y > tip.y);
  return [...below.reverse(), [tip.x, tip.y]].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const inOut = (m: number) => (m < 0.5 ? 2 * m * m : 1 - (-2 * m + 2) ** 2 / 2);

/** Stick-slip easing: `steps` fast jumps, each followed by a short plateau. Monotonic, 0→1. */
export function stickSlip(x: number, steps = 5, move = 0.7): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const k = Math.min(steps - 1, Math.floor(x * steps));
  const u = x * steps - k;
  return (k + inOut(Math.min(1, u / move))) / steps;
}

export type HalfState = { x: number; y: number; rz: number; rx: number; ry: number; shadow: number };
export type Side = "left" | "right";

/**
 * Scrubbed pose of one half at rip progress p (0–0.6 is scrubbed; the fly-off is physics).
 * Rotation signs open the wedge from the bottom: left swings clockwise, right counter-clockwise.
 */
export function basePose(p: number, side: Side): HalfState & { cut: number } {
  const lift = clamp01(p / 0.1);
  const cut = stickSlip(clamp01((p - 0.1) / 0.5));
  const sep = inOut(clamp01((p - 0.35) / 0.25));
  const y = -6 * lift - 40 * sep;
  const shadow = 0.3 * lift + 0.7 * sep;
  return side === "left"
    ? { x: -150 * sep, y, rz: 2 * cut * cut + 6 * sep, rx: 4 * sep, ry: -14 * sep, shadow, cut }
    : { x: 150 * sep, y, rz: -(1.6 * cut * cut + 4.4 * sep), rx: 3 * sep, ry: 12 * sep, shadow, cut };
}

type Throw = { delay: number; vx: number; vy: number; g: number; dragT: number; spin: number; spinT: number; flutter: number; freq: number; ryEnd: number };

// Never mirrored: the right half leaves later, flatter, with a different spin and flutter.
const THROWS: Record<Side, Throw> = {
  left: { delay: 0, vx: -2600, vy: -700, g: 2600, dragT: 0.45, spin: -70, spinT: 0.5, flutter: 18, freq: 2.2, ryEnd: -28 },
  right: { delay: 0.09, vx: 2300, vy: -560, g: 2300, dragT: 0.5, spin: 55, spinT: 0.6, flutter: 14, freq: 2.7, ryEnd: 24 },
};
export const FLY_DURATION = 1.6;

/** Fly-off pose `t` seconds after release from `from`. `k` ≥ 1 scales the throw with scroll speed. */
export function flyPose(from: HalfState, side: Side, t: number, k: number): HalfState {
  const c = THROWS[side];
  const tt = Math.max(0, t - c.delay);
  const damp = Math.exp(-tt / 0.45);
  const wobble = Math.sin(2 * Math.PI * c.freq * tt);
  return {
    x: from.x + c.vx * k * c.dragT * (1 - Math.exp(-tt / c.dragT)), // air drag: eases out
    y: from.y + c.vy * k * tt + 0.5 * c.g * tt * tt, // gravity: accelerates
    rz: from.rz + c.spin * k * c.spinT * (1 - Math.exp(-tt / c.spinT)) + 3 * damp * Math.sin(2 * Math.PI * c.freq * tt + 1),
    rx: from.rx + c.flutter * damp * wobble,
    ry: from.ry + (c.ryEnd - from.ry) * (1 - Math.exp(-tt / 0.5)),
    shadow: 1,
  };
}

export const lerpPose = (a: HalfState, b: HalfState, e: number): HalfState => ({
  x: a.x + (b.x - a.x) * e,
  y: a.y + (b.y - a.y) * e,
  rz: a.rz + (b.rz - a.rz) * e,
  rx: a.rx + (b.rx - a.rx) * e,
  ry: a.ry + (b.ry - a.ry) * e,
  shadow: a.shadow + (b.shadow - a.shadow) * e,
});

/** Overshooting ease for the re-assembly snap. */
export const backOut = (t: number, s = 1.6) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
