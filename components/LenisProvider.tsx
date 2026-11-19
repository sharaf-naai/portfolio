"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LenisContext = createContext<Lenis | null>(null);

/** The Lenis instance, or null under prefers-reduced-motion (native scroll). */
export const useLenis = () => useContext(LenisContext);

/** Run `update` now, on every scroll (Lenis or native) and on resize. */
export function useOnScroll(update: () => void) {
  const lenis = useLenis();
  const ref = useRef(update);
  ref.current = update;
  useEffect(() => {
    const run = () => ref.current();
    run();
    window.addEventListener("resize", run);
    const off = lenis ? lenis.on("scroll", run) : (window.addEventListener("scroll", run, { passive: true }), () => window.removeEventListener("scroll", run));
    return () => {
      off();
      window.removeEventListener("resize", run);
    };
  }, [lenis]);
}

/**
 * Is the point (x, y) over a visible paper sheet ([data-theme="paper"], set by <Paper>)?
 * By geometry, not hit-testing: the rip's right half is `inert`, and browsers skip inert elements in elementsFromPoint.
 */
export function overPaper(x: number, y: number) {
  return [...document.querySelectorAll('[data-theme="paper"]')].some((el) => {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  });
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ anchors: true, lerp: 0.15 }); // #hash links scroll through Lenis; lerp 0.15 (default 0.1 felt floaty)
    instance.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000); // GSAP ticker is in seconds
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
