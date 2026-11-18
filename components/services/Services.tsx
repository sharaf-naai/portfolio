import { CURRENCIES, FALLBACK_RATES, RATES_URL, type Currency } from "@/lib/pricing";
import Brief from "./Brief";

/** EUR-based daily rates, cached 24h; any missing or bad value falls back to the static rate. */
async function getRates(): Promise<Record<Currency, number>> {
  try {
    const res = await fetch(RATES_URL, { next: { revalidate: 86_400 } });
    if (!res.ok) return FALLBACK_RATES;
    const rates: unknown = (await res.json())?.rates;
    const out = { ...FALLBACK_RATES };
    for (const c of CURRENCIES) {
      const v = (rates as Record<string, unknown> | undefined)?.[c];
      if (typeof v === "number" && Number.isFinite(v) && v > 0) out[c] = v;
    }
    return out;
  } catch {
    return FALLBACK_RATES;
  }
}

/** 03 Services: "Build your brief". No public prices, budget ranges by country. */
export default async function Services() {
  return <Brief rates={await getRates()} />;
}
