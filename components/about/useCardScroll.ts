"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The card rises from below (rotateX 25° → flat) as the section arrives, then the section pins ~80vh:
 * the hologram shimmer sweeps once and the name's raised letters light up left to right.
 * Halfway through the pin, `onHint` runs once (the knob nudge). Reduced motion: nothing, plain scroll.
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
      // Pin once the label + title + card block is centered on screen,
      // so the gap above the label equals the gap below the card.
      const content = root.querySelector("[data-about-content]");
      const centered = "center center";
      const rise = { trigger: content, start: "top 80%", end: centered, scrub: 0.25 };

      gsap.from(root.querySelector("[data-card-rise]"), { yPercent: 45, rotateX: 25, opacity: 0, ease: "power2.out", scrollTrigger: rise });
      gsap.from(root.querySelector("[data-card-shadow]"), { opacity: 0, scale: 0.6, ease: "power2.out", scrollTrigger: rise });

      let hinted = false;
      gsap
        .timeline({
          scrollTrigger: {
            trigger: content,
            start: centered,
            end: "+=80%",
            pin: root,
            scrub: 0.25,
            onUpdate: (self) => {
              if (hinted || self.progress < 0.5) return;
              hinted = true;
              hint.current();
            },
          },
        })
        .fromTo(root.querySelector("[data-holo]"), { "--sweep": "-120%" }, { "--sweep": "120%", ease: "none", duration: 0.5 }, 0)
        .fromTo(root.querySelectorAll("[data-letter]"), { color: "#4A4843" }, { color: "#D9D6CF", stagger: 0.05, duration: 0.2, ease: "none" }, 0.2);
    });

    return () => mm.revert();
  }, [rootRef]);
}
