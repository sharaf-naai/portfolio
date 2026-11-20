"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { wheelScale } from "@/lib/wheel";
import { useLenis } from "../LenisProvider";

import { DESKTOP_MOTION } from "@/lib/media";

const NUDGE = 0.12; // share of one card step that counts as "I meant to move"

/** Page y of an element's top from layout (offsetTop chain), so transforms don't move it. */
const layoutTop = (el: HTMLElement) => {
  let y = 0;
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
  return y;
};

/**
 * Pins the Work section and turns the wheel one card per screen of scroll, snapping to cards.
 * Writes `--rot` / `--s` on the cards container; CSS places the cards. Returns goTo(i).
 */
export function useWheel(rootRef: RefObject<HTMLElement | null>, cardsRef: RefObject<HTMLElement | null>, count: number, onActive: (i: number) => void) {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const stRef = useRef<ScrollTrigger | null>(null);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  useEffect(() => {
    const root = rootRef.current;
    const cards = cardsRef.current;
    if (!root || !cards) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(DESKTOP_MOTION, () => {
      const setScale = () => cards.style.setProperty("--s", String(wheelScale(window.innerWidth, window.innerHeight)));
      setScale();
      window.addEventListener("resize", setScale);

      let active = 0;
      let snapTimer = 0;
      const proxy = { rot: 0 };

      // Own snap (instead of ScrollTrigger's) so it goes through Lenis and doesn't fight it.
      const snapLater = (self: ScrollTrigger) => {
        clearTimeout(snapTimer);
        snapTimer = window.setTimeout(() => {
          if (!self.isActive) return;
          // Snap the way the visitor is scrolling: a small nudge moves on to the next card instead of
          // pulling the one that started to arrive back out of view.
          const pos = self.progress * (count - 1);
          const i = self.direction > 0 ? Math.ceil(pos - NUDGE) : Math.floor(pos + NUDGE);
          const y = self.start + ((self.end - self.start) * i) / (count - 1);
          if (Math.abs(window.scrollY - y) > 2) scrollToY(y);
        }, 160);
      };

      const tween = gsap.to(proxy, {
        rot: count - 1,
        ease: "none",
        // Start from the layout position, not the on-screen one: useRip shifts #work with a transform during the rip.
        scrollTrigger: { trigger: root, start: () => layoutTop(root), end: `+=${(count - 1) * 70}%`, pin: true, scrub: 0.25, onUpdate: snapLater },
        onUpdate: () => {
          cards.style.setProperty("--rot", proxy.rot.toFixed(4));
          const i = Math.round(proxy.rot);
          if (i !== active) {
            active = i;
            onActiveRef.current(i);
          }
        },
      });
      stRef.current = tween.scrollTrigger!;

      return () => {
        clearTimeout(snapTimer);
        window.removeEventListener("resize", setScale);
        cards.style.removeProperty("--rot");
        stRef.current = null;
      };
    });

    return () => mm.revert();
  }, [rootRef, cardsRef, count]);

  function scrollToY(y: number) {
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 0.5 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }

  /** Scroll so card i is the active one (wheel mode only). */
  return (i: number) => {
    const st = stRef.current;
    if (st) scrollToY(st.start + ((st.end - st.start) * i) / (count - 1));
  };
}
