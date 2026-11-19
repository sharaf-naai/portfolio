// "Build your brief" (03 Services). No public prices and no suggested ranges: the client types their own budget.
// The visitor's country only picks the default currency of the budget field.

/** Default currency per country. */
export const COUNTRIES = {
  MA: "MAD", SN: "XOF", CI: "XOF", PT: "EUR", ES: "EUR", IT: "EUR", FR: "EUR", BE: "EUR", DE: "EUR", NL: "EUR",
  IE: "EUR", GB: "GBP", CA: "CAD", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", US: "USD", CH: "CHF", LU: "EUR",
  OTHER: "USD",
} as const;

export type CountryCode = keyof typeof COUNTRIES;
export const isCountry = (c: string | undefined): c is CountryCode => !!c && Object.hasOwn(COUNTRIES, c);

/** The currency dropdown (shown in this order). */
export const CURRENCIES = ["MAD", "XOF", "EUR", "GBP", "CHF", "CAD", "USD", "AED", "SAR", "QAR", "KWD"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** WhatsApp number, international format without "+". */
export const WHATSAPP_NUMBER = "212681679598";

/** Typed budget → "15,000 MAD" in the locale's grouping, Western digits. Empty or 0 → null (not sure yet). */
export function formatBudget(digits: string, currency: string, locale = "en"): string | null {
  const v = Number(digits);
  return v > 0 ? `${new Intl.NumberFormat(locale, { numberingSystem: "latn" }).format(v)} ${currency}` : null;
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
 * "Hi! I'd like a website + booking system. Budget: 15,000 MAD. Timeline: 1–2 months."
 */
export function briefMessage(template: string, o: { need: string; addons: string[]; budget: string; time: string }) {
  const parts: Record<string, string> = {
    need: lowerFirst(o.need),
    addons: o.addons.map((a) => ` + ${lowerFirst(a)}`).join(""),
    budget: o.budget,
    timeline: o.time,
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => parts[k] ?? m);
}

export const whatsappUrl = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
