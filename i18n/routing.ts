import { defineRouting } from "next-intl/routing";

// Always English unless the visitor picked a language: "/" goes to the saved NEXT_LOCALE cookie, else /en.
// No Accept-Language, never by country. The cookie is read in proxy.ts and written by LanguageSwitcher.
export const routing = defineRouting({ locales: ["en", "fr", "ar"], defaultLocale: "en", localePrefix: "always", localeDetection: false });
export type Locale = (typeof routing.locales)[number];
