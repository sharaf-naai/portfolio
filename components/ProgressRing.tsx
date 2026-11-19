"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMessages } from "next-intl";
import { useLenis, useOnScroll } from "./LenisProvider";
import { clamp01 } from "@/lib/rip";

const CHAPTERS = ["hero", "work", "services", "about", "contact"];
const R = 30;
const C = 2 * Math.PI * R;
const END = 0.995;

const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

/**
 * The page's only navigation: a progress ring in the bottom-right corner (bottom-left in Arabic). The red arc fills clockwise
 * with scroll; one dot per chapter. Click = next chapter; at the end it becomes ↑ and rewinds to the top.
 */
export default function ProgressRing() {
  const { controls: t } = useMessages();
  const lenis = useLenis();
  const btn = useRef<HTMLButtonElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const setArc = useRef<(v: number) => void>(null);
  const p = useRef(0);
  const [ticks, setTicks] = useState<number[]>([]); // chapter starts, as fractions of the scroll range
  const [passed, setPassed] = useState(1);
  const [atEnd, setAtEnd] = useState(false);

  // Chapter starts. Pinned sections are measured by their pin-spacer, which holds the pin's scroll length.
  useEffect(() => {
    setArc.current = gsap.quickSetter(arc.current, "strokeDashoffset") as (v: number) => void;
    const measure = () => {
      const max = maxScroll();
      setTicks(
        CHAPTERS.map((id) => {
          const el = document.getElementById(id);
          const box = el?.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
          return box ? clamp01((box.getBoundingClientRect().top + window.scrollY) / max) : 1;
        }),
      );
    };
    const ro = new ResizeObserver(measure); // also fires once on observe
    ro.observe(document.body);
    ScrollTrigger.addEventListener("refresh", measure);
    return () => {
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", measure);
    };
  }, []);

  // Per scroll frame: arc + % go straight to the DOM; React only re-renders when a dot or the end state flips.
  useOnScroll(() => {
    const v = clamp01(window.scrollY / maxScroll());
    p.current = v;
    setArc.current?.(C * (1 - v));
    const n = Math.round(v * 100);
    if (pct.current) pct.current.textContent = `${n}%`;
    btn.current?.setAttribute("aria-label", v >= END ? t.ringTop : t.ringProgress.replace("{p}", String(n)));
    setPassed(ticks.filter((s) => s <= v + 0.001).length);
    setAtEnd(v >= END);
  });

  const go = () => {
    const next = ticks.find((s) => s > p.current + 0.002);
    const y = atEnd || next === undefined ? 0 : next * maxScroll();
    if (lenis) lenis.scrollTo(y, { duration: y === 0 ? 1.6 : 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <button
      ref={btn}
      type="button"
      onClick={go}
      aria-label={t.ringProgress.replace("{p}", "0")}
      className="group fixed end-7 bottom-7 z-50 size-[76px] rounded-full bg-[rgba(12,12,12,.88)] text-bone shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-[1.08] focus-visible:scale-[1.08]"
    >
      <svg aria-hidden="true" viewBox="0 0 76 76" className="absolute inset-0 -rotate-90">
        <circle cx="38" cy="38" r={R} fill="none" stroke="rgba(237,235,230,.18)" strokeWidth="8" />
        <circle ref={arc} cx="38" cy="38" r={R} fill="none" stroke="var(--color-action)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
        {ticks.map((s, i) => (
          <circle
            key={CHAPTERS[i]}
            cx={38 + R * Math.cos(2 * Math.PI * s)}
            cy={38 + R * Math.sin(2 * Math.PI * s)}
            r="3"
            fill={i < passed ? "var(--color-action)" : "var(--color-bone)"}
            stroke="#0C0C0C"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <span aria-hidden="true" className="relative font-mono text-[13px] font-medium">
        {atEnd ? (
          "↑"
        ) : (
          <>
            <span ref={pct} className="group-hover:hidden group-focus-visible:hidden">0%</span>
            <span className="hidden text-[11px] group-hover:inline group-focus-visible:inline">{t.ringHint}</span>
          </>
        )}
      </span>
    </button>
  );
}
