// Which devices get the desktop experience (3D paper rip, pinned Work wheel).
// Wide, landscape and tall enough: laptops, desktops, iPads held sideways.
// Everything else (phones either way round, upright tablets) gets the phone version.
// globals.css repeats these numbers in the Work wheel @media block: keep both in sync.
const DESKTOP_PARTS = ["(min-width: 1024px)", "(min-height: 500px)", "(orientation: landscape)"];
const MOTION = "(prefers-reduced-motion: no-preference)";

export const DESKTOP_MOTION = [...DESKTOP_PARTS, MOTION].join(" and ");

/** The opposite of the desktop rule (any one part fails), with motion allowed. */
export const PHONE_MOTION = ["(max-width: 1023px)", "(max-height: 499px)", "(orientation: portrait)"]
  .map((q) => `${q} and ${MOTION}`)
  .join(", ");
