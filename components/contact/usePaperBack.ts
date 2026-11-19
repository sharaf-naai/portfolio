"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fiberPoints } from "@/lib/rip";

/**
 * Bookend to the hero rip: the two torn halves fly back in from the sides and join with a small
 * overshoot, then a strip of tape lands across the seam and the content appears.
 * One-shot on enter, reversed when scrolling back above. Reduced motion: everything already in place.
 */
export function usePaperBack(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    q("[data-fiber]").forEach((f) => f.setAttribute("points", fiberPoints(1))); // the whole seam shows
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const [left, right] = q("[data-half]");
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 70%", toggleActions: "play none none reverse" },
        })
        .from(left, { xPercent: -110, yPercent: -8, rotation: -14, duration: 0.9, ease: "back.out(1.3)" }, 0)
        .from(right, { xPercent: 110, yPercent: -5, rotation: 11, duration: 0.9, ease: "back.out(1.3)" }, 0.08) // never mirrored
        .from(q("[data-tape]"), { scale: 1.8, rotation: -24, autoAlpha: 0, duration: 0.35, ease: "back.out(2.2)" }, 0.9)
        .from(q("[data-contact-content]"), { autoAlpha: 0, y: 24, duration: 0.5, ease: "power2.out" }, 0.85);
    });

    return () => mm.revert();
  }, [rootRef]);
}
