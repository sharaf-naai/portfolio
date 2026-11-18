"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import messages from "@/messages/en.json";
import { WHEEL } from "@/lib/wheel";
import Grain from "../Grain";
import CardVideo from "./CardVideo";
import { useWheel, WHEEL_QUERY } from "./useWheel";

const t = messages.work;

const THEMES = {
  paper: { bg: "#F1F0EC", fg: "#141414", line: "rgba(20,20,20,0.18)" },
  ink: { bg: "#121212", fg: "#EDEBE6", line: "rgba(237,235,230,0.18)" },
  red: { bg: "#E0281E", fg: "#FFF6F2", line: "rgba(255,246,242,0.35)" },
};

// Media per project, same order as messages.work.projects. Add video/poster paths (e.g. /assets/videos/hanabaly.mp4) when recorded.
const MEDIA: { theme: keyof typeof THEMES; shot: string; video?: string; poster?: string }[] = [
  { theme: "paper", shot: "linear-gradient(135deg,#B5482E,#2A120C)" },
  { theme: "ink", shot: "linear-gradient(135deg,#2E5E5A,#0E1414)" },
  { theme: "red", shot: "linear-gradient(135deg,#3D6BFF,#0B0E1A)" },
  { theme: "ink", shot: "linear-gradient(135deg,#F2A81D,#2A1A06)" },
  { theme: "paper", shot: "" }, // "Your project": dashed call-to-action, no video
];

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const wheel = useMedia(WHEEL_QUERY);
  const goTo = useWheel(root, cardsRef, t.projects.length, setActive);
  const p = t.projects[active];

  return (
    <section
      ref={root}
      id="work"
      aria-label={t.label}
      className="relative z-0 overflow-hidden px-4 py-24 text-bone"
      style={{
        background: [
          "radial-gradient(45% 50% at 70% 50%, rgba(47,183,168,0.28), transparent 70%)",
          "radial-gradient(35% 40% at 15% 85%, rgba(242,168,29,0.18), transparent 70%)",
          "linear-gradient(180deg, var(--color-night), var(--color-night-deep))",
        ].join(", "),
      }}
    >
      <Grain opacity={0.18} blend="screen" />

      <h2 className="work-stack-only label-mono relative mb-10 text-center text-[11px] tracking-[0.14em] text-red-light">{t.label}</h2>

      {/* Active project panel (wheel mode only) */}
      <div className="work-panel absolute top-16 left-16 z-20 hidden w-[clamp(260px,29vw,420px)]">
        <p className="label-mono mb-[18px] text-[11px] tracking-[0.14em] text-red-light">{t.label}</p>
        <p aria-hidden="true" className="headline text-[clamp(72px,min(10.4vw,15svh),150px)] leading-[0.85] text-transparent [-webkit-text-stroke:1.5px_var(--color-bone)]">
          {`0${active + 1}`}
        </p>
        <h3 className="headline mt-2.5 text-[clamp(30px,min(3.75vw,6svh),54px)] leading-[0.92]">{p.name}</h3>
        <p className="mt-3.5 max-w-[360px] font-mono text-[13px] leading-[1.7] text-[#CFCCC5]">{p.sentence}</p>
        <dl className="label-mono mt-[22px] grid grid-cols-[80px_minmax(0,1fr)] text-[11px] tracking-[0.08em]">
          {(["type", "for", "stack", "year"] as const).map((k) => (
            <Fragment key={k}>
              <dt className="border-t border-[#2E2E2E] py-2 text-[#A9A7A1]">{t.details[k]}</dt>
              <dd className="m-0 border-t border-[#2E2E2E] py-2">{p[k]}</dd>
            </Fragment>
          ))}
        </dl>
        <div className="mt-[26px] flex items-center gap-[18px]">
          {/* shortcut: disabled until the full-screen project viewer exists */}
          <button type="button" disabled className="rounded-full bg-bone px-5 py-3.5 text-[13px] font-extrabold tracking-[0.04em] text-ink uppercase [font-stretch:112%]">
            {t.openProject}
          </button>
          <span aria-hidden="true" className="inline-block -rotate-4 font-hand text-[22px] text-red-light">{t.fullScreen}</span>
        </div>
      </div>

      {/* Project list, right of the wheel and vertically centred so the bottom bar never covers it (wheel mode only) */}
      <div className="work-panel absolute top-1/2 right-[clamp(16px,4vw,64px)] z-20 hidden -translate-y-1/2">
        <ol className="flex flex-col gap-2.5">
          {t.projects.map((proj, i) => (
            <li key={proj.name}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === active || undefined}
                className={`label-mono flex min-h-6 items-center gap-3 text-[11px] ${i === active ? "text-bone" : "text-[#8E8C87]"}`}
              >
                <span aria-hidden="true" className={`h-0.5 transition-all ${i === active ? "w-7 bg-red" : "w-3 bg-[#5A5854]"}`} />
                {`0${i + 1} ${proj.name}`}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div
        ref={cardsRef}
        className="wheel-cards relative flex flex-col items-center gap-10"
        style={{ "--cx": `${WHEEL.cx}px`, "--r": `${WHEEL.r}px`, "--step": `${WHEEL.step}deg` } as React.CSSProperties}
      >
        {t.projects.map((proj, i) => {
          const m = MEDIA[i];
          const th = THEMES[m.theme];
          const isActive = wheel && i === active;
          const cta = "cta" in proj ? proj.cta : null;
          return (
            <article
              key={proj.name}
              aria-label={proj.name}
              data-active={isActive}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="wheel-card relative w-full max-w-[520px] overflow-hidden rounded-[14px] shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              style={{ "--i": i, zIndex: 10 - Math.abs(i - active), background: th.bg, color: th.fg } as React.CSSProperties}
            >
              <div className="flex h-7 items-center gap-1.5 border-b px-3" style={{ borderColor: th.line }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} aria-hidden="true" className="size-[7px] rounded-full border-[1.5px] border-current" />
                ))}
                <span className="label-mono ml-2.5 text-[10px] tracking-[0.12em] opacity-80">{`0${i + 1} · ${proj.kind}`}</span>
              </div>
              {isActive && !cta && (
                <span className="label-mono absolute top-10 right-3.5 z-[2] rounded bg-red px-2 py-1.5 text-[10px] tracking-[0.12em] text-[#FFF6F2]">{t.playing}</span>
              )}
              <div className="card-body grid gap-3.5 p-3.5">
                <div className="flex flex-col justify-between gap-4">
                  <p className="card-num headline m-0 text-5xl">{`0${i + 1}`}</p>
                  <div>
                    <p className="m-0 text-[22px] leading-none font-black uppercase [font-stretch:112%]">{proj.name}</p>
                    <p className="label-mono mt-2.5 border-t pt-2 text-[10px] opacity-85" style={{ borderColor: th.line }}>{`${proj.kind} · ${proj.year}`}</p>
                  </div>
                </div>
                {cta ? (
                  <a href="#contact" className="flex min-h-40 items-center justify-center rounded-lg border-2 border-dashed font-hand text-[30px]" style={{ borderColor: th.line }}>
                    {cta}
                  </a>
                ) : (
                  <CardVideo
                    src={m.video}
                    poster={m.poster}
                    shot={m.shot}
                    label={`${t.videoPlaceholder}: ${proj.name}`}
                    placeholderText={t.videoPlaceholder}
                    stack={!wheel}
                    playing={i === active || i === hovered}
                    load={Math.abs(i - active) <= 1 || i === hovered}
                  />
                )}
              </div>
              <p className="work-stack-only px-3.5 pb-3.5 font-mono text-[13px] leading-[1.6] opacity-80">{proj.sentence}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
