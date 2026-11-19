import { defineRouting } from "next-intl/routing";

// "/" redirects to /en, /fr or /ar: saved NEXT_LOCALE cookie → Accept-Language → en. Never by country.
export const routing = defineRouting({ locales: ["en", "fr", "ar"], defaultLocale: "en", localePrefix: "always" });
export type Locale = (typeof routing.locales)[number];
