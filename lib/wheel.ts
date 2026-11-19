// Work wheel geometry (design canvas at 1440 wide): arc centre off-screen left, cards on its rim.
export const WHEEL = { cx: -260, r: 1110, step: 17, cardW: 520, cardH: 330, designW: 1440 };

/** Whole wheel scales with the viewport width. */
export const wheelScale = (vw: number) => Math.min(1.15, Math.max(0.5, vw / WHEEL.designW));

/**
 * Centre (px from the section's top-left) and angle (deg) of card `i` when the wheel sits at `rot`.
 * `dir` -1 (Arabic) mirrors the wheel: same maths as the .wheel-card rule in globals.css.
 */
export function cardPose(i: number, rot: number, vw: number, vh: number, dir: 1 | -1 = 1) {
  const s = wheelScale(vw);
  const angle = (i - rot) * WHEEL.step;
  const rad = (angle * Math.PI) / 180;
  const x = (WHEEL.cx + Math.cos(rad) * WHEEL.r) * s;
  return { x: vw / 2 + dir * (x - vw / 2), y: vh / 2 + Math.sin(rad) * WHEEL.r * s, angle: dir * angle, scale: s };
}
