"use client";

import { useLocale, useMessages } from "next-intl";
import { routing } from "@/i18n/routing";

const NAMES = { en: "EN", fr: "FR", ar: "ع" } as const;

/**
 * EN · FR · ع. Real links (full page load, so <html lang/dir> and fonts switch); `hash` keeps the visitor
 * in the same section of the new language. next-intl saves the choice in the NEXT_LOCALE cookie.
 */
export default function LanguageSwitcher({ hash = "", className = "" }: { hash?: string; className?: string }) {
  const locale = useLocale();
  const { controls } = useMessages();
  return (
    <nav aria-label={controls.language} className={`flex items-center ${className}`}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span aria-hidden="true" className="px-0.5 text-graphite">
              ·
            </span>
          )}
          <a
            href={`/${l}${hash}`}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={`relative flex min-h-11 min-w-11 items-center justify-center ${
              l === "ar" ? "font-display text-[18px]" : "font-mono text-[13px]"
            } ${l === locale ? "font-semibold text-ink" : "text-graphite hover:text-ink"}`}
          >
            {NAMES[l]}
            {l === locale && (
              <svg aria-hidden="true" viewBox="0 0 40 8" preserveAspectRatio="none" className="absolute inset-x-2 bottom-2 h-1.5 w-[calc(100%-16px)]" fill="none" stroke="var(--color-pen)" strokeWidth="2" strokeLinecap="round">
                <path d="M2 5 C10 2 18 7 26 4 S36 3 38 5" />
              </svg>
            )}
          </a>
        </span>
      ))}
    </nav>
  );
}
