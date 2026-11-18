"use client";

import { useEffect, useId, useState } from "react";
import messages from "@/messages/en.json";
import Paper from "../Paper";
import {
  COUNTRIES, CURRENCIES, SHOW_START_LINE, bands, briefMessage, detectCountry, edges, whatsappUrl,
  type CountryCode, type Currency, type Need,
} from "@/lib/pricing";

const t = messages.services;

// Torn-receipt zigzag along the bottom edge.
const TEETH = 26;
const RECEIPT_CLIP = `polygon(0% 0%, 100% 0%, ${Array.from({ length: TEETH + 1 }, (_, i) => {
  const x = (100 - (i * 100) / TEETH).toFixed(2);
  return `${x}% calc(100% - ${i % 2 ? 0 : 10}px)`;
}).join(", ")})`;

const pill = (on: boolean) =>
  `min-h-[46px] cursor-pointer whitespace-nowrap rounded-full border-2 border-ink px-4 text-[13px] font-extrabold uppercase tracking-[0.04em] [font-stretch:112%] transition-colors ${
    on ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-ink/10"
  }`;
const stepLabel = "label-mono mb-2.5 mt-6 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] tracking-[0.14em] text-[#3A3A3A]";

function Pills({ legend, items, value, onPick, extra }: { legend: string; items: string[]; value: number; onPick: (i: number) => void; extra?: React.ReactNode }) {
  const id = useId();
  return (
    <fieldset aria-labelledby={id} className="min-w-0">
      <div className={stepLabel}>
        <span id={id}>{legend}</span>
        {extra}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {items.map((name, i) => (
          <button key={name} type="button" aria-pressed={i === value} onClick={() => onPick(i)} className={pill(i === value)}>
            {name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{k}</span>
      <span aria-hidden="true" className="mb-1 flex-auto border-b border-dotted border-[#9A9893]" />
      <span className="text-right">{v}</span>
    </div>
  );
}

export default function Brief({ rates }: { rates: Record<Currency, number> }) {
  const [country, setCountry] = useState<CountryCode>("OTHER");
  const [currency, setCurrency] = useState<Currency | null>(null); // null = the country's own currency
  const [need, setNeed] = useState(0);
  const [addons, setAddons] = useState<string[]>([]);
  const [budget, setBudget] = useState(4); // "Not sure yet": no anchoring by default
  const [time, setTime] = useState(1);

  // Detection runs in the browser so the page stays static: cookie from proxy.ts → timezone → OTHER.
  useEffect(() => {
    setCountry(detectCountry(document.cookie, Intl.DateTimeFormat().resolvedOptions().timeZone));
  }, []);

  const cur = currency ?? (COUNTRIES[country].currency as Currency);
  const n = t.needs[need];
  const budgets = [...bands(edges(country, n.id as Need, cur, rates), cur), t.notSure];
  const picked = t.addons.filter((a) => addons.includes(a.id));
  const message = briefMessage({ need: n.phrase, addons: picked.map((a) => a.phrase), budget: budgets[budget], time: t.times[time], country });
  const toggle = (id: string) => setAddons((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <section id="services" className="relative z-10">
      <Paper className="min-h-svh px-4 py-16 md:px-10 md:py-20 lg:px-20">
        <div className="relative mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
          <div className="min-w-0">
            <p className="label-mono mb-3.5 text-[11px] tracking-[0.14em] text-[#B3261E]">{t.label}</p>
            <h2 className="headline text-[clamp(40px,6vw,60px)] text-ink">{t.title}</h2>

            <Pills legend={t.steps.need} items={t.needs.map((x) => x.label)} value={need} onPick={setNeed} />

            <fieldset aria-labelledby="brief-addons" className="min-w-0">
              <p id="brief-addons" className={stepLabel}>{t.steps.addons}</p>
              <div className="grid gap-x-7 sm:grid-cols-2">
                {t.addons.map((a) => (
                  <label key={a.id} className="flex cursor-pointer items-center gap-3 border-b-[1.5px] border-dashed border-ink/35 py-[9px]">
                    <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggle(a.id)} className="size-[22px] flex-none accent-red" />
                    <span>
                      <span className="block text-[15px] font-extrabold uppercase text-ink [font-stretch:112%]">{a.name}</span>
                      <span className="block font-mono text-[11px] text-[#4A4844]">{a.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Pills
              legend={t.steps.budget}
              items={budgets}
              value={budget}
              onPick={setBudget}
              extra={
                <span className="inline-flex flex-wrap items-center gap-2 normal-case tracking-normal">
                  <label htmlFor="brief-currency" className="label-mono text-[11px] tracking-[0.14em]">
                    {t.currencyIn}
                  </label>
                  <select
                    id="brief-currency"
                    value={cur}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="min-h-9 cursor-pointer appearance-none rounded-full border-[1.5px] border-ink bg-[#F4F3EF] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-16px)_15px,calc(100%-11px)_15px] bg-no-repeat pl-3 pr-8 font-mono text-xs text-ink"
                    style={{ backgroundImage: "linear-gradient(45deg, transparent 50%, #141414 50%), linear-gradient(135deg, #141414 50%, transparent 50%)" }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{`${t.currencies[c]} · ${c}`}</option>
                    ))}
                  </select>
                  <span className="font-hand text-xl text-red">{t.detected.replace("{country}", t.countries[country])}</span>
                </span>
              }
            />

            <Pills legend={t.steps.time} items={t.times} value={time} onPick={setTime} />
          </div>

          {/* The receipt */}
          <div className="self-start drop-shadow-[0_16px_22px_rgba(0,0,0,0.22)] lg:sticky lg:top-10 lg:rotate-[1.5deg]">
            <div className="bg-[#FAFAF7] px-[26px] pb-10 pt-[26px] font-mono text-xs leading-[1.8] text-ink" style={{ clipPath: RECEIPT_CLIP }}>
              <p className="text-center text-[10px] uppercase tracking-[0.14em]">{t.receipt.header.replace("{name}", messages.hero.name)}</p>
              <p className="headline mt-2.5 border-t border-dashed border-ink pt-2.5 text-[30px] leading-none">{n.label}</p>
              {picked.length > 0 && (
                <div className="mt-2.5">
                  {picked.map((a) => (
                    <Row key={a.id} k={`+ ${a.name}`} v="✓" />
                  ))}
                </div>
              )}
              <div className="mt-3 border-t border-dashed border-ink pt-2.5 uppercase">
                <Row k={t.receipt.budget} v={budgets[budget]} />
                <Row k={t.receipt.timeline} v={t.times[time]} />
              </div>
              <p className="mt-3.5 rounded-md bg-[#EFEEE8] px-3 py-2.5 text-[11px] leading-[1.6] text-[#2A2A2A]">“{message}”</p>
              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-red font-display text-sm font-extrabold uppercase tracking-[0.04em] text-[#FFF6F2] [font-stretch:112%] hover:bg-[#c41f16]"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 22 L7 17 A9 9 0 1 1 11 21 Z" />
                </svg>
                {t.receipt.send}
              </a>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.1em] text-[#4A4844]">{t.receipt.footer}</p>
            </div>
            {SHOW_START_LINE && <p className="mt-4 font-mono text-[11px] text-[#4A4844]">{t.receipt.startLine}</p>}
          </div>
        </div>
      </Paper>
    </section>
  );
}
