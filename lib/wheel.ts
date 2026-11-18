// Work wheel geometry (design canvas at 1440 wide): arc centre off-screen left, cards on its rim.
export const WHEEL = { cx: -260, r: 1110, step: 17, cardW: 520, cardH: 330, designW: 1440 };

/** Whole wheel scales with the viewport width. */
export const wheelScale = (vw: number) => Math.min(1.15, Math.max(0.5, vw / WHEEL.designW));

/** Centre (px from the section's top-left) and angle (deg) of card `i` when the wheel sits at `rot`. */
export function cardPose(i: number, rot: number, vw: number, vh: number) {
  const s = wheelScale(vw);
  const angle = (i - rot) * WHEEL.step;
  const rad = (angle * Math.PI) / 180;
  return { x: (WHEEL.cx + Math.cos(rad) * WHEEL.r) * s, y: vh / 2 + Math.sin(rad) * WHEEL.r * s, angle, scale: s };
}
