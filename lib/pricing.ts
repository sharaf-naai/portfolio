// Budget ranges for the "Build your brief" section (03 Services).
// The COUNTRY picks the ranges and the default currency; the currency dropdown only converts those same ranges.
// Starting values: the owner reviews and adjusts them before launch.

export type Country = { currency: string; a: number; b: number; c: number };

/** Website ranges per country. */
export const COUNTRIES = {
  MA: { currency: "MAD", a: 8_000, b: 15_000, c: 30_000 },
  SN: { currency: "XOF", a: 500_000, b: 1_000_000, c: 2_000_000 },
  CI: { currency: "XOF", a: 600_000, b: 1_200_000, c: 2_400_000 },
  PT: { currency: "EUR", a: 1_200, b: 2_500, c: 5_000 },
  ES: { currency: "EUR", a: 1_500, b: 3_000, c: 6_000 },
  IT: { currency: "EUR", a: 1_500, b: 3_000, c: 6_000 },
  FR: { currency: "EUR", a: 2_000, b: 4_000, c: 8_000 },
  BE: { currency: "EUR", a: 2_000, b: 4_000, c: 8_000 },
  DE: { currency: "EUR", a: 2_500, b: 5_000, c: 10_000 },
  NL: { currency: "EUR", a: 2_500, b: 5_000, c: 10_000 },
  IE: { currency: "EUR", a: 2_500, b: 5_000, c: 10_000 },
  GB: { currency: "GBP", a: 1_800, b: 3_500, c: 7_000 },
  CA: { currency: "CAD", a: 3_000, b: 6_000, c: 12_000 },
  AE: { currency: "AED", a: 8_000, b: 16_000, c: 32_000 },
  SA: { currency: "SAR", a: 8_000, b: 16_000, c: 32_000 },
  QA: { currency: "QAR", a: 8_000, b: 16_000, c: 32_000 },
  KW: { currency: "KWD", a: 700, b: 1_400, c: 2_800 },
  US: { currency: "USD", a: 3_000, b: 6_000, c: 12_000 },
  CH: { currency: "CHF", a: 3_000, b: 6_000, c: 12_000 },
  LU: { currency: "EUR", a: 3_000, b: 6_000, c: 12_000 },
  OTHER: { currency: "USD", a: 2_500, b: 5_000, c: 10_000 },
} satisfies Record<string, Country>;

export type CountryCode = keyof typeof COUNTRIES;
export const isCountry = (c: string | undefined): c is CountryCode => !!c && Object.hasOwn(COUNTRIES, c);

/** Multipliers on the website ranges, same order as messages.services.needs. Add-ons don't change the ranges. */
export const NEED_FACTOR = { website: 1, webapp: 3, crm: 2.5, automation: 0.6 } as const;
export type Need = keyof typeof NEED_FACTOR;

/** The dropdown: currencies of the countries above + USD (shown in this order). */
export const CURRENCIES = ["MAD", "XOF", "EUR", "GBP", "CHF", "CAD", "USD", "AED", "SAR", "QAR", "KWD"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Units per 1 EUR. Static fallback when the daily API fails; XOF is pegged. */
export const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1, MAD: 10.8, XOF: 655.957, GBP: 0.86, CHF: 0.94, CAD: 1.6, USD: 1.16, AED: 4.27, SAR: 4.36, QAR: 4.23, KWD: 0.36,
};

/** Free EUR-based daily rates (includes MAD, XOF, AED, SAR, QAR, KWD). No visitor data is sent. */
export const RATES_URL = "https://open.er-api.com/v6/latest/EUR";

/** WhatsApp number, international format without "+" (e.g. 2126XXXXXXXX). */
export const WHATSAPP_NUMBER = "[OWNER_NUMBER]";

/** Optional "Projects usually start around [X]" line under the receipt. The owner decides; off by default. */
export const SHOW_START_LINE = false;

/** Round to 2 significant figures ("nice" numbers): 744 → 740, 1_512 → 1_500. */
export const nice = (v: number) => Number(v.toPrecision(2));

/** The three band edges [A, B, C] for a country and need, converted into `currency`. */
export function edges(country: CountryCode, need: Need, currency: Currency, rates: Record<Currency, number>): number[] {
  const c = COUNTRIES[country];
  const from = rates[c.currency as Currency];
  return [c.a, c.b, c.c].map((v) => {
    const local = nice(v * NEED_FACTOR[need]);
    return currency === c.currency ? local : nice((local / from) * rates[currency]);
  });
}

export type BandLabels = { under: string; range: string; over: string }; // "Under {a}", "{a} – {b}", "{c}+"

/**
 * Band labels: `Under A` · `A – B` · `B – C` · `C+`, worded and grouped for `locale`, always in Western digits.
 * The last pill ("Not sure yet") comes from the copy.
 */
export function bands([a, b, c]: number[], currency: string, l: BandLabels, locale = "en"): string[] {
  const f = new Intl.NumberFormat(locale, { numberingSystem: "latn" });
  const fill = (tpl: string, v: Record<string, number>) => tpl.replace(/\{(\w)\}/g, (_, k: string) => f.format(v[k]));
  return [fill(l.under, { a }), fill(l.range, { a, b }), fill(l.range, { a: b, b: c }), fill(l.over, { c })].map((s) => `${s} ${currency}`);
}

/** Timezone → country, the fallback when the `country` cookie is missing. Unknown zones → OTHER. */
const TZ: Record<string, CountryCode> = {
  "Africa/Casablanca": "MA", "Africa/Dakar": "SN", "Africa/Abidjan": "CI",
  "Europe/Lisbon": "PT", "Atlantic/Madeira": "PT", "Atlantic/Azores": "PT",
  "Europe/Madrid": "ES", "Atlantic/Canary": "ES", "Africa/Ceuta": "ES",
  "Europe/Rome": "IT", "Europe/Paris": "FR", "Europe/Brussels": "BE", "Europe/Berlin": "DE", "Europe/Busingen": "DE",
  "Europe/Amsterdam": "NL", "Europe/Dublin": "IE", "Europe/London": "GB",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA",
  "America/Halifax": "CA", "America/St_Johns": "CA", "America/Regina": "CA", "America/Montreal": "CA",
  "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Qatar": "QA", "Asia/Kuwait": "KW",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  "America/Phoenix": "US", "America/Anchorage": "US", "America/Detroit": "US", "Pacific/Honolulu": "US",
  "America/Indiana/Indianapolis": "US", "America/Boise": "US",
  "Europe/Zurich": "CH", "Europe/Luxembourg": "LU",
};
export const countryFromTimeZone = (tz: string | undefined): CountryCode => (tz && TZ[tz]) || "OTHER";

/** Country from the `country` cookie (set by proxy.ts), else the timezone, else OTHER. */
export function detectCountry(cookie: string, tz: string | undefined): CountryCode {
  const fromCookie = /(?:^|;\s*)country=([A-Z]{2})/.exec(cookie)?.[1];
  return isCountry(fromCookie) ? fromCookie : countryFromTimeZone(tz);
}

// Mid-sentence: "Website" → "website", but acronyms (CRM, SEO setup) stay as they are. No effect on Arabic.
const lowerFirst = (s: string) => (/^[A-Z][a-zà-ÿ]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

/**
 * The WhatsApp brief from the locale's template (services.whatsapp), e.g.
 * "Hi! I'd like a website + booking system. Budget: 1,800–3,500 GBP. Timeline: 1–2 months. [GB]"
 */
export function briefMessage(template: string, o: { need: string; addons: string[]; budget: string; time: string; country: CountryCode }) {
  const parts: Record<string, string> = {
    need: lowerFirst(o.need),
    addons: o.addons.map((a) => ` + ${lowerFirst(a)}`).join(""),
    budget: o.budget.replace(" – ", "–"),
    timeline: o.time,
    country: o.country,
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => parts[k] ?? m);
}

export const whatsappUrl = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
