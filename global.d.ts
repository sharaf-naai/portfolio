import type en from "./messages/en.json";
import type { routing } from "./i18n/routing";

// Typed messages and locales for useMessages() / useLocale(). fr.json and ar.json have the same keys.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof en;
  }
}
