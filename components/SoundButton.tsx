"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import messages from "@/messages/en.json";
import { overPaper, useOnScroll } from "./LenisProvider";
import { play, setSoundEnabled, soundPref } from "@/lib/sound";

const t = messages.timeline;
const SPEAKER = "M10 26 H20 L32 16 V48 L20 38 H10 Z";
const WAVES = ["M38 27 Q42 32 38 37", "M43 22 Q50 32 43 42", "M48 17 Q58 32 48 47"];
const CROSS = ["M39 23 L56 42", "M56 22 L40 41"];

/** Pencil look: each line drawn twice, the second slightly offset and fainter. */
function Sketchy({ d, stroke }: { d: string; stroke: string }) {
  return (
    <>
      <path d={d} stroke={stroke} strokeWidth="2.2" />
      <path d={d} stroke={stroke} strokeWidth="1.3" opacity="0.55" transform="translate(0.8 0.6) rotate(0.8 32 32)" />
    </>
  );
}

/** Top-right hand-drawn pencil speaker. Off by default; the saved choice comes back on the next visit. */
export default function SoundButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const [on, setOn] = useState(false);
  const [dark, setDark] = useState(false);
  const clicked = useRef(false);

  // Restore the saved choice; the browser keeps audio locked until the first tap/click (Howler unlocks it then).
  useEffect(() => {
    if (!soundPref()) return;
    setOn(true);
    setSoundEnabled(true);
  }, []);

  const check = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setDark(!overPaper(r.left + r.width / 2, r.top + r.height / 2));
  };
  useOnScroll(check);
  // Paper also moves without scrolling (the rip's fly-off, Contact's halves flying in), so re-check now and then.
  useEffect(() => {
    const id = setInterval(check, 300);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- check only reads refs

  // The new state draws itself (~0.35s) after a click.
  useEffect(() => {
    if (!clicked.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(DrawSVGPlugin);
    const paths = ref.current!.querySelectorAll(on ? "[data-waves] path" : "[data-cross] path");
    gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.35, stagger: 0.04, ease: "power1.out" });
  }, [on]);

  const toggle = async () => {
    clicked.current = true;
    setOn(!on);
    await setSoundEnabled(!on); // the first "on" loads Howler and starts the audio context
    if (!on) play("scratch");
  };

  const ink = dark ? "var(--color-bone)" : "#4A4A4A";
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={on}
      aria-label={t.soundLabel}
      onClick={toggle}
      className="fixed top-5 right-6 z-50 flex flex-col items-center"
    >
      <svg aria-hidden="true" viewBox="0 0 64 64" className="size-16" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Sketchy d={SPEAKER} stroke={ink} />
        <g data-waves style={{ display: on ? undefined : "none" }}>
          {WAVES.map((d) => (
            <Sketchy key={d} d={d} stroke={ink} />
          ))}
        </g>
        <g data-cross style={{ display: on ? "none" : undefined }}>
          {CROSS.map((d) => (
            <Sketchy key={d} d={d} stroke="var(--color-red)" />
          ))}
        </g>
      </svg>
      <span aria-hidden="true" className="-mt-1 font-hand text-[18px] leading-none" style={{ color: on ? ink : "var(--color-red)" }}>
        {on ? t.soundOnNote : t.soundOffNote}
      </span>
    </button>
  );
}
