"use client";

import { useEffect, useRef, useState } from "react";
import { useMessages } from "next-intl";
import { whatsappUrl } from "@/lib/pricing";
import { RIP_TOP_X } from "@/lib/rip";
import RipPaper from "../hero/RipPaper";
import Face from "../hero/Face";
import { useFace } from "../hero/useFace";
import { useLenis } from "../LenisProvider";
import { usePaperBack } from "./usePaperBack";
import LanguageSwitcher from "../LanguageSwitcher";

const SOCIAL = [
  ["Instagram", "https://www.instagram.com/sharaf.naai/"],
  ["LinkedIn", "https://www.linkedin.com/in/charaf-e-naai-3970b4219/"],
  ["GitHub", "https://github.com/sharaf-naai"],
] as const;
const REPLY_HOURS = 24;

const PILL = "btn inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6";
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
  const { contact: t, hero } = useMessages();
  const EMAIL = t.email;
  // One line on desktop, two on phones: break after the first space or hyphen ("LET'S / TALK", "PARLONS- / EN").
  const cut = t.title.search(/[ -]/) + 1; // 0 = no break point, one line
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
        <p className="label-mono text-[12px] text-pen">{t.label}</p>
        <h2 className="headline mt-4 text-[clamp(56px,18vw,240px)] whitespace-nowrap">
          {cut ? <>{t.title.slice(0, cut)}<br className="md:hidden" />{t.title.slice(cut)}</> : t.title}
        </h2>

        <div className="mt-6 flex items-center gap-4">
          <Face className="size-[150px]" />
          <span className="inline-block -rotate-4 font-hand text-[36px] leading-none text-pen">{t.note}</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappUrl(t.whatsappText)} target="_blank" rel="noopener noreferrer" className={`${PILL} btn-action`}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 22 L7 17 A9 9 0 1 1 11 21 Z" />
            </svg>
            {t.whatsapp}
          </a>
          <a href={`mailto:${EMAIL}`} className={`${PILL} border-2 border-ink text-ink hover:bg-ink/10`}>
            {EMAIL}
          </a>
        </div>

        <p className="label-mono mt-5 text-[11px] text-graphite">{t.reply.replace("{hours}", String(REPLY_HOURS)).replace("{time}", time)}</p>
      </div>

      <footer data-contact-content className="label-mono relative z-[4] mx-4 mb-[120px] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-ink/25 pt-4 text-[11px] text-ink md:mx-10 md:me-[132px] md:mb-10">
        <span>{`© 2026 ${hero.name}`}</span>
        <span>{t.madeIn}</span>
        <LanguageSwitcher hash="#contact" className="-my-3" />
        {SOCIAL.map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="py-2 text-pen underline-offset-4 hover:underline">
            {label}
          </a>
        ))}
        <button type="button" onClick={rewind} className="py-2 underline-offset-4 hover:underline">
          {t.rewind}
        </button>
      </footer>
    </section>
  );
}
