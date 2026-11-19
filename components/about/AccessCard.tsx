"use client";

import { useRef } from "react";
import { useLocale, useMessages } from "next-intl";
import Grain from "../Grain";
import { useFlip } from "./useFlip";
import { useHologram } from "./useHologram";
import { useCardScroll } from "./useCardScroll";


const BLACK = "radial-gradient(80% 90% at 20% 10%, #23262B, #0B0C0E)";
const GLOWS = "radial-gradient(40% 45% at 25% 70%, rgba(36,80,240,.3), transparent 70%), radial-gradient(35% 40% at 80% 30%, rgba(242,168,29,.2), transparent 70%), linear-gradient(180deg, var(--color-night), var(--color-night-deep))";
// Both faces share one grid cell, so the card grows if a face's content is taller than the ratio (mobile back).
const FACE = "relative overflow-hidden rounded-[24px] [grid-area:1/1] [backface-visibility:hidden]";
const PILL = "btn inline-flex min-h-11 items-center gap-2 rounded-full px-5";

/** 04 About: dark access card. Front = who, back = details, QR and process. Swipe the knob to flip. */
export default function AccessCard({ qr, requestUrl }: { qr: string; requestUrl: string }) {
  const { about: t, hero } = useMessages();
  const NAME = hero.name;
  // Raised letters light up one by one; Arabic letters join, so the name lights up as one piece there.
  const letters = useLocale() === "ar" ? [NAME] : [...NAME];
  const details = [
    [t.fields.experience, t.fields.experienceValue],
    [t.fields.client, "Hanabaly"],
    [t.fields.stack, "Next.js / React / GSAP"],
    [t.fields.studies, t.fields.studiesValue],
  ];
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const flip = useFlip(card);
  useHologram(card);
  useCardScroll(root, flip.nudge);

  return (
    <section ref={root} id="about" className="relative flex min-h-svh items-center overflow-hidden px-4 py-20 md:px-10" style={{ background: GLOWS }}>
      <div data-about-content className="mx-auto w-full max-w-[1200px]">
        <p className="label-mono text-[12px] text-pen-light">{t.label}</p>
        <h2 className="headline mt-3 text-[clamp(40px,7vw,96px)] text-bone">{t.title}</h2>

        <div data-card-stage className="relative mt-10 w-full max-w-[760px] [perspective:1400px]">
          {/* Outside the 3D context on purpose: inside it, the turning card cut through this blob and the half behind it went black. */}
          <div data-card-shadow aria-hidden="true" className="absolute inset-x-[8%] -bottom-6 h-1/3 rounded-[50%] bg-black/80 blur-3xl" />
          <div data-card-rise className="relative [transform-style:preserve-3d]">
            <div ref={card} className="relative grid aspect-[760/480] [transform-style:preserve-3d]">
              {/* FRONT */}
              <div data-front inert={flip.flipped} className={FACE} style={{ background: BLACK }}>
                <Grain opacity={0.08} blend="screen" />
                <div className="relative flex h-full flex-col p-[clamp(16px,4.5%,36px)]">
                  <div className="flex items-start justify-between">
                    <p className="headline text-[clamp(16px,3.6vw,28px)] text-[#D9D6CF]">{t.cardTitle}</p>
                    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A877F" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M8 8.5a5 5 0 0 1 0 7M11.5 6a8.5 8.5 0 0 1 0 12M15 3.5a12 12 0 0 1 0 17" />
                    </svg>
                  </div>

                  <div className="mt-3 flex min-h-0 flex-1 gap-4">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-3">
                        {/* Chip with contact lines */}
                        <span aria-hidden="true" className="relative h-[clamp(30px,6vw,44px)] w-[clamp(40px,8vw,58px)] shrink-0 overflow-hidden rounded-md" style={{ background: "linear-gradient(135deg, #E5C67A, #9C7A35)" }}>
                          <span className="absolute inset-x-0 top-1/3 h-px bg-[#6E5424]/60" />
                          <span className="absolute inset-x-0 top-2/3 h-px bg-[#6E5424]/60" />
                          <span className="absolute inset-y-[18%] left-1/2 w-px bg-[#6E5424]/60" />
                          <span className="absolute inset-[30%_30%] rounded-sm border border-[#6E5424]/60" />
                        </span>
                        <span data-holo aria-hidden="true" className="holo h-[clamp(22px,5vw,36px)] w-[clamp(70px,22vw,180px)] rounded-md" />
                      </div>
                      <div className="mt-auto">
                        <p className="headline raised text-[clamp(24px,6vw,54px)]">
                          <span className="sr-only">{NAME}</span>
                          {letters.map((c, i) => (
                            <span key={i} data-letter aria-hidden="true">
                              {c}
                            </span>
                          ))}
                        </p>
                        <p className="label-mono mt-2 text-[clamp(9px,1.6vw,12px)] text-[#8A877F]">{t.role}</p>
                      </div>
                    </div>
                    {/* shortcut: placeholder until the owner's B&W photo arrives; swap for next/image with grayscale */}
                    <div role="img" aria-label={t.photoAlt} className="label-mono flex aspect-[150/180] w-[clamp(84px,20%,150px)] shrink-0 items-center justify-center self-start rounded-[10px] bg-[linear-gradient(160deg,#5A5A5A,#1E1E1E)] text-[10px] text-[#AAA] grayscale">
                      {t.photo}
                    </div>
                  </div>

                  <div ref={flip.trackRef} className="relative mt-4 rounded-full border border-[#33363C] bg-[#1C1E22] p-1.5">
                    <span data-slide-label aria-hidden="true" className="label-mono pointer-events-none absolute inset-0 flex items-center justify-center ps-10 text-[11px] text-bone/70">
                      {t.slide}
                    </span>
                    <button
                      ref={flip.knobRef}
                      type="button"
                      aria-label={t.flip}
                      {...flip.knob}
                      className="relative flex size-11 cursor-grab touch-none items-center justify-center rounded-full bg-bone text-xl text-ink active:cursor-grabbing"
                    >
                      ↻
                    </button>
                  </div>
                </div>
              </div>

              {/* BACK (pre-rotated 180°) */}
              <div data-back inert={!flip.flipped} className={`${FACE} card-back`} style={{ background: BLACK }}>
                <Grain opacity={0.08} blend="screen" />
                <div aria-hidden="true" className="relative mt-[clamp(14px,4%,28px)] h-[clamp(28px,9%,44px)] bg-black" />
                <div className="relative px-[clamp(16px,4.5%,36px)] pb-[clamp(16px,4.5%,36px)] pt-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <dl className="label-mono grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-xs">
                      {details.map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-[#8A877F]">{k}</dt>
                          <dd className="text-bone">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div
                      role="img"
                      aria-label={t.qrLabel}
                      className="size-[120px] shrink-0 overflow-hidden rounded-lg [&>svg]:size-full"
                      dangerouslySetInnerHTML={{ __html: qr }}
                    />
                  </div>

                  <ol className="mt-4 grid grid-cols-4 gap-2 border-t border-white/10 pt-3">
                    {t.process.map((step, i) => (
                      <li key={step.title}>
                        <span className="label-mono block text-[10px] text-pen-light">{`0${i + 1}`}</span>
                        <span className="headline block text-[clamp(14px,2.4vw,20px)] text-bone">{step.title}</span>
                        <span className="block text-[12px] leading-snug text-bone/60 max-md:hidden">{step.desc}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href={requestUrl} target="_blank" rel="noopener noreferrer" className={`${PILL} btn-action`}>
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 22 L7 17 A9 9 0 1 1 11 21 Z" />
                      </svg>
                      {t.requestAccess}
                    </a>
                    <button ref={flip.backRef} type="button" onClick={flip.flipBack} className={`${PILL} border border-bone/40 text-bone hover:bg-white/10`}>
                      {t.flipBack}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {flip.flipped ? t.back : t.front}
        </p>
      </div>
    </section>
  );
}
