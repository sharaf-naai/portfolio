"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import messages from "@/messages/en.json";
import { useLenis } from "./LenisProvider";
import Image from "next/image";
import { clamp01 } from "@/lib/rip";
import { play, setSoundEnabled } from "@/lib/sound";

const t = messages.timeline;
const TICKS = Array.from({ length: 60 }, (_, i) => i % 5 === 0);

/**
 * A chapter on the track: `start`/`width` are track fractions (width ∝ section height),
 * `s`/`e` the scroll range (px) during which the playhead crosses it. The playhead maps piecewise,
 * so a short last section still gets a clip as wide as it is tall.
 */
type Clip = { start: number; width: number; s: number; e: number };

const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

function toX(clips: Clip[], y: number) {
  const i = Math.max(0, clips.findLastIndex((c) => c.s <= y));
  const c = clips[i];
  return c ? c.start + c.width * clamp01((y - c.s) / (c.e - c.s || 1)) : 0;
}
function toY(clips: Clip[], x: number) {
  const c = clips.findLast((c) => c.start <= x) ?? clips[0];
  return c ? c.s + (c.e - c.s) * clamp01((x - c.start) / (c.width || 1)) : 0;
}

/** Fixed bottom bar: the page's scrollbar and its chapter navigation. */
export default function Timeline() {
  const lenis = useLenis();
  const [clips, setClips] = useState<Clip[]>([]);
  const [y, setY] = useState(0);
  const [soundOn, setSoundOn] = useState(false);

  // Measure chapters. Pinned sections are measured by their pin-spacer, which holds the pin's scroll length.
  useEffect(() => {
    const measure = () => {
      const docH = document.documentElement.scrollHeight;
      const max = maxScroll();
      const tops = t.chapters.map(({ id }) => {
        const el = document.getElementById(id);
        const box = el?.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
        return box ? box.getBoundingClientRect().top + window.scrollY : docH;
      });
      setClips(
        tops.map((top, i) => {
          const next = tops[i + 1] ?? docH;
          return { start: top / docH, width: (next - top) / docH, s: Math.min(top, max), e: Math.min(next, max) };
        }),
      );
    };
    const ro = new ResizeObserver(measure); // also fires once on observe
    ro.observe(document.body);
    ScrollTrigger.addEventListener("refresh", measure); // pins added or resized
    return () => {
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", measure);
    };
  }, []);

  // Follow scroll (Lenis when on, native scroll under reduced motion).
  useEffect(() => {
    const update = () => setY(window.scrollY);
    update();
    if (lenis) return lenis.on("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [lenis]);

  // Keyboard steps jump at once so repeated presses add up; drags and clicks glide.
  const byKey = useRef(false);
  const scrollToY = (target: number) => {
    if (lenis) lenis.scrollTo(target, { immediate: byKey.current });
    else window.scrollTo({ top: target });
  };

  const x = toX(clips, y);
  const current = Math.max(0, clips.findLastIndex((c) => c.s <= y + 1));
  const chapter = t.chapters[current].label;
  const pct = Math.round(clamp01(y / (clips.length ? maxScroll() : 1)) * 100);

  return (
    <nav
      aria-label={t.navLabel}
      className="fixed inset-x-0 bottom-0 z-50 flex h-[84px] items-center gap-3 border-t border-[#2A2A2A] bg-[rgba(10,10,10,0.94)] px-3 md:gap-6 md:px-7"
    >
      <a href="#hero" aria-label={t.home} className="hidden size-11 shrink-0 overflow-hidden rounded-full bg-paper p-1 sm:block">
        {/* next/image serves a small resized copy of the 2048px source */}
        <Image src="/assets/images/face.png" alt="" width={44} height={44} className="size-full object-contain" />
      </a>

      <div className="label-mono hidden w-[124px] shrink-0 whitespace-nowrap flex-col gap-0.5 md:flex" aria-live="off">
        <span className="text-[12px] text-bone">{`0${current + 1} / 0${t.chapters.length}`}</span>
        <span className="text-[10px] text-[#A9A7A1]">{`${chapter} · ${pct}%`}</span>
      </div>

      <div className="relative min-w-0 flex-1">
        <div aria-hidden="true" className="mb-1 flex h-3 items-end">
          {TICKS.map((major, i) => (
            <span key={i} className={`flex-1 border-l border-[#3A3A3A] ${major ? "h-2.5" : "h-[5px]"}`} />
          ))}
        </div>

        {/* Scrub strip over the ruler; the clips below stay clickable. */}
        <input
          type="range"
          min={0}
          max={1000}
          step={10}
          value={Math.round(x * 1000)}
          onKeyDown={() => (byKey.current = true)}
          onPointerDown={() => (byKey.current = false)}
          onChange={(e) => scrollToY(toY(clips, Number(e.target.value) / 1000))}
          aria-label={t.scrollPosition}
          aria-valuetext={`${chapter}, ${pct}%`}
          className="peer absolute inset-x-0 top-[-10px] z-[2] m-0 h-[26px] w-full cursor-ew-resize appearance-none opacity-0"
        />

        <div className="relative h-[34px]">
          {clips.map((c, i) => {
            const fill = clamp01((x - c.start) / (c.width || 1)) * 100;
            const active = i === current;
            const label = t.chapters[i].label;
            return (
              <button
                key={t.chapters[i].id}
                type="button"
                onClick={() => {
                  play("tick");
                  byKey.current = false;
                  scrollToY(c.s);
                }}
                aria-label={t.goTo.replace("{chapter}", label)}
                aria-current={active ? "step" : undefined}
                className={`label-mono absolute inset-y-0 overflow-hidden rounded border bg-[#1A1A1A] px-0 text-center text-[10px] md:px-2.5 md:text-left md:text-[11px] tracking-[0.08em] whitespace-nowrap ${
                  active ? "border-red text-white" : "border-[#3A3A3A] text-[#D8D6D0]"
                }`}
                style={{ left: `${c.start * 100}%`, width: `calc(${c.width * 100}% - 4px)` }}
              >
                <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-red/32" style={{ width: `${fill}%` }} />
                <span className="relative">
                  {`0${i + 1}`}
                  <span className="max-md:hidden"> {label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-6px] bottom-[-6px] z-[1] -ml-px w-0.5 bg-red peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bone"
          style={{ left: `${x * 100}%` }}
        >
          <span className="absolute top-[-4px] left-[-6px] border-x-[7px] border-t-[10px] border-x-transparent border-t-red" />
        </div>
      </div>

      <button
        type="button"
        aria-label={soundOn ? t.soundOn : t.soundOff}
        onClick={() => {
          setSoundOn(!soundOn);
          setSoundEnabled(!soundOn); // first "on" click loads Howler and starts the audio context
        }}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#3A3A3A] text-bone"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 7h3l4-4v12l-4-4H2z" />
          {soundOn ? <path d="M12 6.5a3.5 3.5 0 0 1 0 5M14.5 4a7 7 0 0 1 0 10" /> : <path d="M13 6l4 6M17 6l-4 6" />}
        </svg>
      </button>

      <a
        href="#contact"
        className="shrink-0 rounded-full bg-paper px-3.5 py-3.5 text-[12px] font-extrabold tracking-[0.04em] whitespace-nowrap text-ink uppercase [font-stretch:112%] md:px-[18px] md:text-[13px]"
      >
        {t.bookCall}
      </a>
    </nav>
  );
}
