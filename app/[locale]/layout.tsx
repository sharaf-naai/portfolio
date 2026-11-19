import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Aref_Ruqaa, Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Lalezar, Nanum_Pen_Script, Schibsted_Grotesk } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import LenisProvider from "@/components/LenisProvider";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Latin roles (EN/FR)
const display = Big_Shoulders({ subsets: ["latin"], weight: ["800", "900"], display: "swap", variable: "--font-big-shoulders" });
const text = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap", variable: "--font-schibsted" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-plex-mono" });
// shortcut: Nanum Pen Script until the owner's own handwriting font exists (Calligraphr → WOFF2 → next/font/local).
const hand = Nanum_Pen_Script({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-nanum-pen" });
// Arabic roles. Not preloaded: the browser only downloads them on pages that use them (AR).
const arDisplay = Lalezar({ subsets: ["arabic"], weight: "400", display: "swap", preload: false, variable: "--font-lalezar" });
const arText = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "600"], display: "swap", preload: false, variable: "--font-plex-arabic" });
const arHand = Aref_Ruqaa({ subsets: ["arabic"], weight: "400", display: "swap", preload: false, variable: "--font-aref-ruqaa" });
const FONTS = [display, text, mono, hand, arDisplay, arText, arHand].map((f) => f.variable).join(" ");

// shortcut: set NEXT_PUBLIC_SITE_URL to the real domain once it exists (absolute hreflang / canonical URLs).
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const { meta } = await getMessages({ locale });
  return {
    metadataBase: new URL(SITE),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])), "x-default": "/" },
    },
    openGraph: { title: meta.title, description: meta.description, locale, type: "website" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={FONTS}>
      <body>
        <NextIntlClientProvider>
          <LenisProvider>{children}</LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
