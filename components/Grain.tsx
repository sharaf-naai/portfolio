import { useId } from "react";

/** SVG feTurbulence grain. Fills its nearest positioned parent. */
export default function Grain({ opacity = 0.16, blend = "multiply" }: { opacity?: number; blend?: "multiply" | "screen" }) {
  const id = useId();
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity, mixBlendMode: blend }}
    >
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
