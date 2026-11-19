import { setRequestLocale, getMessages } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Hero from "@/components/Hero";
import Work from "@/components/work/Work";
import Services from "@/components/services/Services";
import About from "@/components/about/About";
import Contact from "@/components/contact/Contact";
import ProgressRing from "@/components/ProgressRing";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // validated by the layout
  const { controls } = await getMessages();

  return (
    <>
      <a href="#contact" className="sr-only z-[60] rounded-full bg-bone px-4 py-2 font-mono text-xs text-ink uppercase focus:not-sr-only focus:fixed focus:top-4 focus:start-4">
        {controls.skipToContact}
      </a>
      <main>
        <Hero />
        <Work />
        <Services />
        <About />
        <Contact />
      </main>
      <ProgressRing />
    </>
  );
}
