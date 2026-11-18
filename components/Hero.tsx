"use client";

import { useRef } from "react";
import messages from "@/messages/en.json";
import RipPaper from "./hero/RipPaper";
import { useRip } from "./hero/useRip";
import { useFace } from "./hero/useFace";
import Face from "./hero/Face";

const t = messages.hero;

const GLOWS = (teal: string, amber: string) =>
  [
    `radial-gradient(40% 40% at 30% 75%, ${teal}, transparent 70%)`,
    `radial-gradient(35% 35% at 75% 80%, ${amber}, transparent 70%)`,
  ].join(", ");

// The paper covers the top 79% of the hero; polaroids are placed relative to that edge.
const PAPER_H = "79%";
const POLAROIDS = [
  { pos: "left-[6%]", top: `calc(${PAPER_H} - 200px)`, rotate: -7, shot: "linear-gradient(135deg, #2E5E5A, #0E1414)" },
  { pos: "left-[40%] max-md:hidden", top: `calc(${PAPER_H} - 120px)`, rotate: 5, shot: "linear-gradient(135deg, #3D6BFF, #0B0E1A)" },
  { pos: "right-[6%]", top: `calc(${PAPER_H} - 180px)`, rotate: -3, shot: "linear-gradient(135deg, #F2A81D, #2A1A06)" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  useRip(ref);
  useFace(ref);

  return (
    <section ref={ref} id="hero" className="relative z-10 h-svh min-h-[640px] overflow-hidden">
      {/* Dark cinematic layer, revealed by the rip */}
      <div
        data-hero-bg
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: `${GLOWS("var(--color-teal-glow)", "var(--color-amber-glow)")}, linear-gradient(180deg, var(--color-night), var(--color-night-deep))` }}
      />
      <div data-hero-bg data-glow-boost aria-hidden="true" className="absolute inset-0 opacity-0" style={{ background: GLOWS("rgba(47,183,168,0.35)", "rgba(242,168,29,0.3)") }} />
      <p data-hero-bg data-websites aria-hidden="true" className="headline absolute inset-x-0 top-[34%] z-[1] text-center text-[clamp(48px,13vw,210px)] whitespace-nowrap text-bone">
        {t.behind}
      </p>

      <RipPaper height={PAPER_H} className="flex flex-col items-center justify-center px-4 pb-16 md:px-10">
        <div className="w-full max-w-[1100px]">
          <div className="flex justify-between text-[15px] font-bold uppercase tracking-[0.02em] text-ink [font-stretch:112%]">
            <span>{t.kicker}</span>
            <span>{t.year}</span>
          </div>
          <h1 className="headline mt-1.5 text-center text-[clamp(32px,9.5vw,150px)] whitespace-nowrap text-ink">
            <span className="sr-only">{t.name}</span>
            <span aria-hidden="true">
              {/* SHA (face) RAF. The drawn head is 40% taller than the capitals and centered on them.
                  The PNG's head fills 93.4% of its height (1.8% empty above, 4.9% below), so the box is
                  1.4 / 0.934 ≈ 1.5cap, lowered so the head's bottom lands 0.2cap under the baseline. */}
              {t.name.slice(0, 3)}
              <Face className="mx-[0.06em] size-[1.5cap] align-[-0.27cap]" />
              {t.name.slice(3)}
            </span>
          </h1>
        </div>

        <div className="mt-3.5 flex items-end gap-2">
          <svg aria-hidden="true" width="34" height="46" viewBox="0 0 34 46" fill="none" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round">
            <path d="M28 42 C6 40 4 22 10 4 M4 12 L10 3 L16 11" />
          </svg>
          <span data-note className="inline-block -rotate-4 font-hand text-[30px] font-medium text-red">
            {t.note}
          </span>
        </div>

        <p aria-hidden="true" className="mt-9 text-[28px] tracking-[0.1em] text-ink">✸ ✦ ♣</p>
      </RipPaper>

      {POLAROIDS.map((p, i) => (
        <figure
          key={i}
          data-polaroid
          className={`absolute z-[3] m-0 bg-[#FAFAF7] px-2.5 pt-2.5 pb-[34px] shadow-[0_10px_22px_rgba(0,0,0,0.3)] will-change-transform max-md:scale-75 ${p.pos}`}
          style={{ top: p.top, transform: `rotate(${p.rotate}deg)` }}
        >
          <span aria-hidden="true" className="absolute top-[-12px] left-[70px] h-6 w-20 -rotate-4 bg-[rgba(240,220,160,0.75)]" />
          <div role="img" aria-label={t.polaroids[i].alt} className="h-[140px] w-[200px]" style={{ background: p.shot }} />
          <figcaption className="mt-2 font-hand text-[22px] text-ink">{t.polaroids[i].caption}</figcaption>
        </figure>
      ))}
    </section>
  );
}
