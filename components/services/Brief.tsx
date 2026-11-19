"use client";

import { useEffect, useId, useState } from "react";
import { useLocale, useMessages } from "next-intl";
import Paper from "../Paper";
import { COUNTRIES, CURRENCIES, briefMessage, detectCountry, formatBudget, whatsappUrl, type CountryCode, type Currency } from "@/lib/pricing";

// Message keys, in pill order.
const NEEDS = ["website", "webApp", "crm", "automation"] as const;
const ADDONS = ["lang", "booking", "whatsapp", "cms", "seo", "care"] as const;
const TIMES = ["asap", "soon", "noRush"] as const;
const CURRENCY_KEY = "currency"; // kept across language switches

// Torn-receipt zigzag along the bottom edge.
const TEETH = 26;
const RECEIPT_CLIP = `polygon(0% 0%, 100% 0%, ${Array.from({ length: TEETH + 1 }, (_, i) => {
  const x = (100 - (i * 100) / TEETH).toFixed(2);
  return `${x}% calc(100% - ${i % 2 ? 0 : 10}px)`;
}).join(", ")})`;

const pill = (on: boolean) =>
  `btn min-h-[46px] cursor-pointer whitespace-nowrap rounded-full border-2 px-4 transition-colors ${
    on ? "border-action bg-action text-[#FFF6F2]" : "border-ink bg-transparent text-ink hover:bg-ink/10"
  }`;
const stepLabel = "label-mono mb-2.5 mt-6 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-graphite";

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
      <span className="text-end">{v}</span>
    </div>
  );
}

export default function Brief() {
  const { services: t, hero } = useMessages();
  const locale = useLocale();
  const [country, setCountry] = useState<CountryCode | null>(null); // null until detected in the browser (keeps server and client HTML equal)
  const [currency, setCurrency] = useState<Currency | null>(null); // null = the country's own currency
  const [need, setNeed] = useState(0);
  const [addons, setAddons] = useState<string[]>([]);
  const [amount, setAmount] = useState(""); // digits only; empty = "Not sure yet"
  const [time, setTime] = useState(1);

  // Detection runs in the browser so the page stays static: cookie from proxy.ts → timezone → OTHER.
  // The country only picks the default currency. The currency choice survives a language switch.
  useEffect(() => {
    setCountry(detectCountry(document.cookie, Intl.DateTimeFormat().resolvedOptions().timeZone));
    try {
      const saved = localStorage.getItem(CURRENCY_KEY);
      if (saved && (CURRENCIES as readonly string[]).includes(saved)) setCurrency(saved as Currency);
    } catch {}
  }, []);
  const pickCurrency = (c: Currency) => {
    setCurrency(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch {}
  };
  // Country and currency names come from the browser, already translated ("OTHER" shows as "World").
  const regionName = (c: CountryCode) => new Intl.DisplayNames([locale], { type: "region" }).of(c === "OTHER" ? "001" : c) ?? c;
  const currencyName = (c: Currency) => new Intl.DisplayNames([locale], { type: "currency" }).of(c) ?? c;

  const cur = currency ?? COUNTRIES[country ?? "OTHER"];
  const needName = t.needs[NEEDS[need]];
  const budget = formatBudget(amount, cur, locale) ?? t.notSure;
  const picked = ADDONS.filter((id) => addons.includes(id)).map((id) => ({ id, ...t.addons[id] }));
  const times = TIMES.map((k) => t.timing[k]);
  const message = briefMessage(t.whatsapp, { need: needName, addons: picked.map((a) => a.name), budget, time: times[time] });
  const toggle = (id: string) => setAddons((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <section id="services" className="relative z-10">
      <Paper className="min-h-svh px-4 py-16 md:px-10 md:py-20 lg:px-20">
        <div className="relative mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
          <div className="min-w-0">
            <p className="label-mono mb-3.5 text-[12px] text-pen">{t.label}</p>
            <h2 className="headline text-[clamp(48px,7vw,80px)] text-ink">{t.title}</h2>

            <Pills legend={`1 · ${t.step1}`} items={NEEDS.map((k) => t.needs[k])} value={need} onPick={setNeed} />

            <fieldset aria-labelledby="brief-addons" className="min-w-0">
              <p id="brief-addons" className={stepLabel}>{`2 · ${t.step2}`}</p>
              <div className="grid gap-x-7 sm:grid-cols-2">
                {ADDONS.map((id) => ({ id, ...t.addons[id] })).map((a) => (
                  <label key={a.id} className="flex cursor-pointer items-center gap-3 border-b-[1.5px] border-dashed border-ink/35 py-[9px]">
                    <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggle(a.id)} className="size-[22px] flex-none accent-action" />
                    <span>
                      <span className="block text-[16px] font-semibold text-ink">{a.name}</span>
                      <span className="block text-[14px] text-graphite">{a.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset aria-labelledby="brief-budget" className="min-w-0">
              <p id="brief-budget" className={stepLabel}>{`3 · ${t.step3}`}</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={cur}
                  onChange={(e) => pickCurrency(e.target.value as Currency)}
                  aria-label={t.currencyLabel}
                  className="min-h-[46px] max-w-full cursor-pointer appearance-none rounded-full border-2 border-ink bg-[#F4F3EF] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-18px)_20px,calc(100%-13px)_20px] bg-no-repeat ps-4 pe-9 font-mono text-xs text-ink rtl:bg-[position:18px_20px,13px_20px]"
                  style={{ backgroundImage: "linear-gradient(45deg, transparent 50%, #141414 50%), linear-gradient(135deg, #141414 50%, transparent 50%)" }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{`${currencyName(c)} · ${c}`}</option>
                  ))}
                </select>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/D/g, "").slice(0, 10))}
                  aria-label={t.amount}
                  placeholder={t.amountPlaceholder}
                  className="min-h-[46px] w-[220px] max-w-full rounded-full border-2 border-ink bg-transparent px-4 text-[16px] text-ink placeholder:text-graphite"
                />
              </div>
              {country && <p className="mt-2 font-hand text-[26px] leading-none text-pen">{t.detected.replace("{country}", regionName(country))}</p>}
            </fieldset>

            <Pills legend={`4 · ${t.step4}`} items={times} value={time} onPick={setTime} />
          </div>

          {/* The receipt */}
          <div className="self-start drop-shadow-[0_16px_22px_rgba(0,0,0,0.22)] lg:sticky lg:top-10 lg:rotate-[1.5deg]">
            <div className="bg-[#FAFAF7] px-[26px] pb-10 pt-[26px] font-mono text-xs leading-[1.8] text-ink" style={{ clipPath: RECEIPT_CLIP }}>
              <p className="text-center text-[10px] uppercase tracking-[0.14em]">{`${hero.name} · ${t.receipt.title}`}</p>
              <p className="headline mt-2.5 border-t border-dashed border-ink pt-2.5 text-[36px]">{needName}</p>
              {picked.length > 0 && (
                <div className="mt-2.5">
                  {picked.map((a) => (
                    <Row key={a.id} k={`+ ${a.name}`} v="✓" />
                  ))}
                </div>
              )}
              <div className="mt-3 border-t border-dashed border-ink pt-2.5 uppercase">
                <Row k={t.receipt.budget} v={budget} />
                <Row k={t.receipt.timeline} v={times[time]} />
              </div>
              <p className="mt-3.5 rounded-md bg-[#EFEEE8] px-3 py-2.5 text-[11px] leading-[1.6] text-[#2A2A2A]">“{message}”</p>
              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-action mt-3.5 flex min-h-12 items-center justify-center gap-2.5 rounded-full"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 22 L7 17 A9 9 0 1 1 11 21 Z" />
                </svg>
                {t.receipt.send}
              </a>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.1em] text-[#4A4844]">{t.receipt.footer}</p>
            </div>
          </div>
        </div>
      </Paper>
    </section>
  );
}
