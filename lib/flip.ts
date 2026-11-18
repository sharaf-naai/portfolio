/** Knob position (0–1 of the track) past which releasing completes the flip. */
export const FLIP_AT = 0.6;
/** Max card rotateY (deg) while dragging, reached at FLIP_AT. */
export const MAX_TILT = 25;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** Card rotateY while the knob is dragged to fraction p: follows the finger up to MAX_TILT, then holds. */
export const dragTilt = (p: number) => (MAX_TILT * Math.min(clamp01(p), FLIP_AT)) / FLIP_AT;

/** Does releasing the knob at p flip the card? */
export const releaseFlips = (p: number) => clamp01(p) >= FLIP_AT;
