"use client";

import { useEffect, useRef, useState } from "react";
import messages from "@/messages/en.json";
import { whatsappUrl } from "@/lib/pricing";
import { RIP_TOP_X } from "@/lib/rip";
import RipPaper from "../hero/RipPaper";
import Face from "../hero/Face";
import { useFace } from "../hero/useFace";
import { useLenis } from "../LenisProvider";
import { usePaperBack } from "./usePaperBack";

const t = messages.contact;
const EMAIL = t.email; // shortcut: "[EMAIL]" placeholder until the owner gives the address
// shortcut: Instagram / LinkedIn URLs not given yet; they render as plain text until filled in.
const SOCIAL: { label: string; url: string | null }[] = [
  { label: "Instagram", url: null },
  { label: "LinkedIn", url: null },
  { label: "GitHub", url: "https://github.com/sharaf-naai" },
];

const PILL = "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 font-display text-sm font-extrabold uppercase tracking-[0.04em] [font-stretch:112%]";
const moroccoTime = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });

/** Live HH:MM in Morocco. Rendered after mount so server and client HTML match. */
function useMoroccoTime() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () => setTime(moroccoTime.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/** 05 Contact (C1): the paper comes back. */
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const time = useMoroccoTime();
  usePaperBack(root);
  useFace(root);

  const rewind = () => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }));

  return (
    <section
      ref={root}
      id="contact"
      className="relative flex min-h-svh flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--color-night), var(--color-night-deep))" }}
    >
      {/* The two torn halves, empty: content sits on its own layer so all of it stays clickable.
          Taller than the section so the torn bottom edge is cut off. */}
      <RipPaper height="calc(100% + 40px)" className="">
        {null}
      </RipPaper>
      <span
        data-tape
        aria-hidden="true"
        className="absolute top-[14%] z-[3] h-7 w-32 -translate-x-1/2 -rotate-[8deg] bg-[rgba(240,220,160,0.75)] shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
        style={{ left: `${RIP_TOP_X}%` }}
      />

      <div data-contact-content className="relative z-[4] flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-24 text-center text-ink">
        <p className="label-mono text-[11px] tracking-[0.14em] text-red">{t.label}</p>
        <h2 className="headline mt-4 text-[clamp(64px,13vw,200px)] whitespace-nowrap">
          {t.title[0]}
          <br className="md:hidden" /> {t.title[1]}
        </h2>

        <div className="mt-6 flex items-center gap-4">
          <Face className="size-[150px]" />
          <span className="inline-block -rotate-4 font-hand text-[28px] text-red">{t.note}</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappUrl(t.waMessage)} target="_blank" rel="noopener noreferrer" className={`${PILL} bg-red text-[#FFF6F2] hover:bg-[#c41f16]`}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 22 L7 17 A9 9 0 1 1 11 21 Z" />
            </svg>
            {t.whatsapp}
          </a>
          <a href={`mailto:${EMAIL}`} className={`${PILL} border-2 border-ink text-ink normal-case hover:bg-ink/10`}>
            {EMAIL}
          </a>
        </div>

        <p className="label-mono mt-5 text-[11px] text-[#4A4844]">{t.replies.replace("{time}", time)}</p>
      </div>

      <footer data-contact-content className="label-mono relative z-[4] mx-4 mb-[120px] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-ink/25 pt-4 text-[11px] text-ink md:mx-10 md:mr-[132px] md:mb-10">
        <span>{t.footer.copy.replace("{name}", messages.hero.name)}</span>
        <span>{t.footer.made}</span>
        <span aria-label={t.footer.languages}>{t.footer.langs.join(" · ")}</span>
        {SOCIAL.map(({ label, url }) =>
          url ? (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {label}
            </a>
          ) : (
            <span key={label}>{label}</span>
          ),
        )}
        <button type="button" onClick={rewind} className="py-2 underline-offset-4 hover:underline">
          {t.footer.rewind}
        </button>
      </footer>
    </section>
  );
}
