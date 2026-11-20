"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  backOut, basePose, fiberPoints, flyPose, lerpPose, tipAt,
  FLY_DURATION, RIP_BOTTOM_PX, RIP_TOP_X, type HalfState, type Side,
} from "@/lib/rip";
import { DESKTOP_MOTION, PHONE_MOTION } from "@/lib/media";

const RELEASE = 0.6; // tear complete → halves are thrown (physics, not scrub)
const REASSEMBLE = 0.55; // scrolling back above this snaps them home
const ASSEMBLE_S = 0.6;
const SIDES: Side[] = ["left", "right"];

/** Scroll-driven paper rip for the hero. Expects the data-* hooks rendered by Hero/RipPaper. */
export function useRip(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(DESKTOP_MOTION, () => {
      const halves = q("[data-half]") as HTMLElement[];
      const fibers = q("[data-fiber]") as Element[];
      const rip = q("[data-rip]")[0] as HTMLElement;
      const restShadow = rip.style.filter;
      let W = 0;
      let H = 0;
      const measure = () => {
        W = halves[0].offsetWidth;
        H = halves[0].offsetHeight;
      };
      measure();

      // Rotating about the tear tip keeps the halves joined above it. CSS rotates about the rip top,
      // so add the translation that turns one into the other: t = d − R·d, d = tip − ripTop.
      const apply = (i: number, s: HalfState, cut: number) => {
        const tip = tipAt(cut);
        const dx = ((tip.x - RIP_TOP_X) / 100) * W;
        const dy = (tip.y / 100) * (H - RIP_BOTTOM_PX);
        const a = (s.rz * Math.PI) / 180;
        const tx = dx - (dx * Math.cos(a) - dy * Math.sin(a));
        const ty = dy - (dx * Math.sin(a) + dy * Math.cos(a));
        halves[i].style.transform = `translate3d(${s.x + tx}px, ${s.y + ty}px, 0) rotateZ(${s.rz}deg) rotateY(${s.ry}deg) rotateX(${s.rx}deg)`;
        // one shadow for both halves (set on the container); it grows and blurs as they rise
        if (i === 0) rip.style.filter = `drop-shadow(0 ${4 + 26 * s.shadow}px ${6 + 30 * s.shadow}px rgba(0,0,0,${0.25 + 0.25 * s.shadow}))`;
      };
      const setFibers = (cut: number) => {
        const pts = fiberPoints(cut);
        fibers.forEach((f) => f.setAttribute("points", pts));
      };
      const show = (v: boolean) => halves.forEach((h) => (h.style.visibility = v ? "" : "hidden"));

      let mode: "scrubbed" | "flying" | "assembling" | "gone" = "scrubbed";
      let p = 0;
      let first = true;
      let t0 = 0;
      let throwK = 1;
      let from: HalfState[] = [];
      const current: HalfState[] = SIDES.map((s) => basePose(0, s));

      const startTicker = () => {
        t0 = gsap.ticker.time;
        gsap.ticker.remove(tick);
        gsap.ticker.add(tick);
      };

      function tick() {
        const t = gsap.ticker.time - t0;
        if (mode === "flying") {
          SIDES.forEach((s, i) => apply(i, (current[i] = flyPose(from[i], s, t, throwK)), 1));
          if (t > FLY_DURATION) {
            mode = "gone";
            show(false);
            gsap.ticker.remove(tick);
          }
        } else if (mode === "assembling") {
          const e = backOut(Math.min(1, t / ASSEMBLE_S));
          SIDES.forEach((s, i) => {
            const b = basePose(p, s);
            apply(i, (current[i] = lerpPose(from[i], b, e)), b.cut);
            if (i === 0) setFibers(b.cut);
          });
          if (t >= ASSEMBLE_S) {
            mode = "scrubbed";
            gsap.ticker.remove(tick);
            render();
          }
        }
      }

      function render() {
        if (first) {
          first = false;
          if (p >= RELEASE) {
            // loaded mid-page: already torn, no throw
            mode = "gone";
            return show(false);
          }
        }
        if (mode === "scrubbed") {
          if (p >= RELEASE) {
            from = SIDES.map((s) => basePose(RELEASE, s));
            throwK = 1 + gsap.utils.clamp(0, 1.5, Math.abs(st.getVelocity()) / 2500); // faster scroll, harder throw
            setFibers(1);
            mode = "flying";
            return startTicker();
          }
          SIDES.forEach((s, i) => {
            const b = basePose(p, s);
            apply(i, (current[i] = b), b.cut);
            if (i === 0) setFibers(b.cut);
          });
        } else if ((mode === "flying" || mode === "gone") && p < REASSEMBLE) {
          from = current.map((c) => ({ ...c }));
          mode = "assembling";
          show(true);
          startTicker();
        }
      }

      // Work sits under the pinned hero (margin-top: -100svh) but would still scroll up during the rip and
      // show its top edge as the dark layer fades. Shift it back by the distance not yet scrolled, so it
      // stays put and the fade reveals it in place. The wheel reads its start from layout (useWheel), and the
      // shift is lifted while ScrollTrigger measures, so the wheel's pin never records it.
      const work = document.getElementById("work");
      let refreshing = false; // ScrollTrigger replays updates mid-refresh; never shift while it measures
      const holdWork = (self: ScrollTrigger) => {
        if (work && !refreshing) work.style.transform = `translate3d(0, ${-(1 - self.progress) * (self.end - self.start)}px, 0)`;
      };
      const unhold = () => {
        refreshing = true;
        work?.style.removeProperty("transform");
      };
      const rehold = () => {
        refreshing = false;
        holdWork(st);
      };
      ScrollTrigger.addEventListener("refreshInit", unhold);
      ScrollTrigger.addEventListener("refresh", rehold);

      const proxy = { p: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=90%",
          pin: true,
          scrub: 0.25, // Lenis already smooths; a big scrub on top makes the tear lag behind the finger
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: holdWork,
        },
      });
      const st = tl.scrollTrigger!;

      tl.to(proxy, {
        p: 1,
        duration: 1,
        onUpdate: () => {
          p = proxy.p;
          render();
        },
      }, 0);

      // 0–10% build-up: the note wiggles
      tl.to(q("[data-note]"), { keyframes: { rotation: [0, 3, -2, 2, 0] }, duration: 0.1 }, 0);
      // The language switcher lives on the paper: it leaves as the tear starts.
      tl.to(q("[data-hero-controls]"), { autoAlpha: 0, duration: 0.08 }, 0.1);

      // 35–65% split: WEBSITES settles
      tl.fromTo(q("[data-websites]"), { scale: 1.12 }, { scale: 1, duration: 0.3 }, 0.35);

      // 75–90% WEBSITES leaves; 75–100% the dark layer cross-fades into the Work wheel underneath (no pop)
      tl.to(q("[data-websites]"), { autoAlpha: 0, duration: 0.15 }, 0.75);
      tl.to(q("[data-hero-bg]:not([data-websites])"), { autoAlpha: 0, duration: 0.25 }, 0.75);
      // Once torn, nothing in the hero is clickable, and it (plus its pin-spacer) overlaps the pinned
      // wheel for a screen: let clicks through to the Work panel.
      const spacer = root.parentElement;
      if (spacer?.classList.contains("pin-spacer")) spacer.style.pointerEvents = "none";
      gsap.set(root, { pointerEvents: "auto" });
      tl.set(root, { pointerEvents: "none" }, RELEASE);

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", unhold);
        ScrollTrigger.removeEventListener("refresh", rehold);
        unhold();
        gsap.ticker.remove(tick);
        halves.forEach((h) => {
          h.style.transform = "";
          h.style.visibility = "";
        });
        rip.style.filter = restShadow;
        setFibers(0);
      };
    });

    // Phones and upright tablets: one torn sheet slides up and away, no split, no pin.
    mm.add(PHONE_MOTION, () => {
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } })
        .to(q("[data-half]"), { yPercent: -70, rotation: -4, duration: 1 }, 0);
    });

    return () => mm.revert();
  }, [rootRef]);
}
