"use client";

import { useRef } from "react";
import { useLocale, useMessages } from "next-intl";
import RipPaper from "./hero/RipPaper";
import { useRip } from "./hero/useRip";
import { useFace } from "./hero/useFace";
import Face from "./hero/Face";
import LanguageSwitcher from "./LanguageSwitcher";

// The paper covers the top 90% of the hero; the dark layer shows below its torn edge.
const PAPER_H = "90%";

export default function Hero() {
  const { hero: t } = useMessages();
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  useRip(ref);
  useFace(ref);

  // EN/FR: "SHA(face)RAF". AR has no O to replace: the face sits right before the name.
  const split = locale === "ar" ? 0 : 3;

  return (
    <section ref={ref} id="hero" className="relative z-10 h-svh min-h-[640px] overflow-hidden">
      {/* Dark cinematic layer, revealed by the rip */}
      <div data-hero-bg aria-hidden="true" className="night-blend absolute inset-0" />
      <p data-hero-bg data-websites aria-hidden="true" className="headline absolute inset-x-0 top-[34%] z-[1] text-center text-[clamp(56px,15vw,240px)] whitespace-nowrap text-bone">
        {t.bigWord}
      </p>

      <RipPaper height={PAPER_H} className="flex flex-col items-center justify-center px-4 pb-16 md:px-10">
        <div className="w-full max-w-[1100px]">
          <div className="label-mono flex justify-between text-[13px] text-ink">
            <span>{t.role}</span>
            <span>{t.year}</span>
          </div>
          {/* Spec: clamp(120px, 16vw, 250px). Phones get a smaller floor so the name stays on one line. */}
          <h1 className="headline mt-1.5 text-center text-[clamp(72px,16vw,250px)] whitespace-nowrap text-ink max-md:text-[clamp(56px,20vw,120px)]">
            <span className="sr-only">{t.name}</span>
            <span aria-hidden="true">
              {/* The drawn head is 40% taller than the capitals and centered on them.
                  The PNG's head fills 93.4% of its height (1.8% empty above, 4.9% below), so the box is
                  1.4 / 0.934 ≈ 1.5cap, lowered so the head's bottom lands 0.2cap under the baseline. */}
              {t.name.slice(0, split)}
              <Face className="mx-[0.06em] size-[1.5cap] align-[-0.27cap]" />
              {t.name.slice(split)}
            </span>
          </h1>
        </div>

        <div className="mt-3.5 flex items-end gap-2">
          <svg aria-hidden="true" width="34" height="46" viewBox="0 0 34 46" fill="none" stroke="var(--color-pen)" strokeWidth="2" strokeLinecap="round" className="rtl:-scale-x-100">
            <path d="M28 42 C6 40 4 22 10 4 M4 12 L10 3 L16 11" />
          </svg>
          <span data-note className="inline-block -rotate-4 font-hand text-[clamp(32px,10vw,40px)] leading-none text-balance text-pen">
            {t.note}
          </span>
        </div>
      </RipPaper>

      {/* Language switcher: on the paper, top-right (top-left in Arabic). Not fixed: it scrolls away with the hero and fades as the rip starts (useRip). */}
      <div data-hero-controls className="absolute top-4 end-4 z-[4] flex items-start gap-3 md:end-7">
        <LanguageSwitcher />
      </div>
    </section>
  );
}
