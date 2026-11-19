import Hero from "@/components/Hero";
import Work from "@/components/work/Work";
import Services from "@/components/services/Services";
import About from "@/components/about/About";
import Contact from "@/components/contact/Contact";
import ProgressRing from "@/components/ProgressRing";
import SoundButton from "@/components/SoundButton";
import messages from "@/messages/en.json";

export default function Home() {
  return (
    <>
      <a href="#contact" className="sr-only z-[60] rounded-full bg-bone px-4 py-2 font-mono text-xs text-ink uppercase focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        {messages.timeline.skipToContact}
      </a>
      <main>
        <Hero />
        <Work />
        <Services />
        <About />
        <Contact />
      </main>
      <SoundButton />
      <ProgressRing />
    </>
  );
}
