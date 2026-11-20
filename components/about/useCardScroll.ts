"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Normal scroll, no pin (owner's choice). As the section arrives the card rises (rotateX 25° → flat),
 * the hologram shimmer sweeps once and the name's raised letters light up left to right.
 * Once the card is fully in view, `onHint` runs once (the knob nudge). Reduced motion: nothing, plain scroll.
 */
export function useCardScroll(rootRef: RefObject<HTMLElement | null>, onHint: () => void) {
  const hint = useRef(onHint);
  hint.current = onHint;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const card = root.querySelector("[data-card-stage]") as HTMLElement;
      const rise = { trigger: card, start: "top 95%", end: "top 45%", scrub: 0.25 };

      gsap.from(root.querySelector("[data-card-rise]"), { yPercent: 45, rotateX: 25, opacity: 0, ease: "power2.out", scrollTrigger: rise });
      gsap.from(root.querySelector("[data-card-shadow]"), { opacity: 0, scale: 0.6, ease: "power2.out", scrollTrigger: rise });

      // Shimmer + letters play while the card scrolls from the lower half of the screen to the top.
      gsap
        .timeline({ scrollTrigger: { trigger: card, start: "top 60%", end: "center 35%", scrub: 0.25 } })
        .fromTo(root.querySelector("[data-holo]"), { "--sweep": "-120%" }, { "--sweep": "120%", ease: "none", duration: 0.5 }, 0)
        .fromTo(root.querySelectorAll("[data-letter]"), { color: "#4A4843" }, { color: "#D9D6CF", stagger: 0.05, duration: 0.2, ease: "none" }, 0.2);

      // Knob nudge once, when the whole card is on screen (bottom of the card past the bottom of the screen).
      ScrollTrigger.create({ trigger: card, start: "bottom 95%", once: true, onEnter: () => hint.current() });
    });

    return () => mm.revert();
  }, [rootRef]);
}
