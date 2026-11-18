import Hero from "@/components/Hero";
import Work from "@/components/work/Work";
import Services from "@/components/services/Services";
import About from "@/components/about/About";
import Timeline from "@/components/Timeline";
import messages from "@/messages/en.json";

export default function Home() {
  return (
    <>
      <main className="pb-[84px]">
        <Hero />
        <Work />
        <Services />
        <About />
        {/* shortcut: empty chapter stubs so the timeline has sections to map; replaced as each chapter is built */}
        {messages.timeline.chapters.slice(4).map(({ id, label }, i) => (
          <section key={id} id={id} className="flex min-h-svh items-center justify-center border-t border-white/10">
            <h2 className="headline text-[clamp(40px,8vw,120px)] text-bone/20">{`0${i + 5} ${label}`}</h2>
          </section>
        ))}
      </main>
      <Timeline />
    </>
  );
}
