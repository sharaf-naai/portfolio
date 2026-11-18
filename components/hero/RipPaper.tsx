import Paper from "../Paper";
import { LEFT_CLIP, RIGHT_CLIP, RIP_TOP_X } from "@/lib/rip";

/**
 * The hero paper, rendered twice and clipped along the rip line (left / right half).
 * Each half: an outer wrapper that moves and an inner clipped sheet. The drop-shadow sits on the
 * shared container, so it outlines both halves together and never shows along the joined rip.
 * Keep the paper behind this component so it can later become a WebGL plane without touching the page.
 */
export default function RipPaper({ height, className, children }: { height: string; className: string; children: React.ReactNode }) {
  return (
    <div
      data-rip
      className="pointer-events-none absolute inset-x-0 top-0 z-[2]"
      style={{ height, perspective: "1200px", perspectiveOrigin: `${RIP_TOP_X}% 0%`, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
    >
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          data-half={side}
          aria-hidden={side === "right" || undefined}
          inert={side === "right" || undefined}
          className="pointer-events-auto absolute inset-0 will-change-transform"
          style={{ transformOrigin: `${RIP_TOP_X}% 0%` }}
        >
          <Paper className={`h-full ${className}`} style={{ clipPath: side === "left" ? LEFT_CLIP : RIGHT_CLIP }}>
            {children}
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* paper fibres along the tear; points are written by useRip as the cut travels */}
              <polyline data-fiber points="" fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </Paper>
        </div>
      ))}
    </div>
  );
}
