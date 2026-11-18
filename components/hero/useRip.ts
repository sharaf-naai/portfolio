"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  backOut, basePose, fiberPoints, flyPose, lerpPose, tipAt,
  FLY_DURATION, RIP_BOTTOM_PX, RIP_TOP_X, type HalfState, type Side,
} from "@/lib/rip";
import { cardPose, WHEEL } from "@/lib/wheel";
import { crossingGuard } from "@/lib/crossings";
import { play, type SoundName } from "@/lib/sound";

const RELEASE = 0.6; // tear complete → halves are thrown (physics, not scrub)
const REASSEMBLE = 0.55; // scrolling back above this snaps them home
const ASSEMBLE_S = 0.6;
const SIDES: Side[] = ["left", "right"];

const SOUNDS = crossingGuard<SoundName>([
  { at: 0.05, dir: "down", name: "tapePeel" },
  { at: 0.25, dir: "down", name: "rip1" },
  { at: 0.45, dir: "down", name: "rip2" },
  { at: 0.65, dir: "down", name: "rip3" },
  { at: 0.25, dir: "up", name: "rustle" },
  { at: 0.75, dir: "down", name: "whoosh" },
]);

/** Scroll-driven paper rip for the hero. Expects the data-* hooks rendered by Hero/RipPaper. */
export function useRip(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const halves = q("[data-half]") as HTMLElement[];
      const fibers = q("[data-fiber]") as Element[];
      const polaroids = q("[data-polaroid]") as HTMLElement[];
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

      const proxy = { p: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=120%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: measure,
        },
      });
      const st = tl.scrollTrigger!;

      tl.to(proxy, {
        p: 1,
        duration: 1,
        onUpdate: () => {
          p = proxy.p;
          render();
          SOUNDS(p, performance.now(), (name) =>
            play(name, name.startsWith("rip") ? gsap.utils.clamp(0.3, 1, Math.abs(st.getVelocity()) / 2000) : 1),
          );
        },
      }, 0);

      // 0–10% build-up: polaroids lift, the note wiggles
      polaroids.forEach((el, j) =>
        tl.to(el, { y: [-14, -18, -16][j], rotation: `+=${[-2, 2, -1.5][j]}`, boxShadow: "0 26px 40px rgba(0,0,0,0.38)", duration: 0.1 }, 0),
      );
      tl.to(q("[data-note]"), { keyframes: { rotation: [0, 3, -2, 2, 0] }, duration: 0.1 }, 0);

      // 35–65% split: WEBSITES settles, glows brighten
      tl.fromTo(q("[data-websites]"), { scale: 1.12 }, { scale: 1, duration: 0.3 }, 0.35);
      tl.fromTo(q("[data-glow-boost]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.35);

      // 65–95% handoff: polaroids 02–04 move onto their wheel cards' poses (wheel at rest on card 01)
      polaroids.forEach((el, j) => {
        const pose = () => cardPose(j + 1, 0, window.innerWidth, window.innerHeight);
        tl.to(el, {
          x: () => pose().x - (el.offsetLeft + el.offsetWidth / 2),
          y: () => pose().y - (el.offsetTop + el.offsetHeight / 2),
          rotation: () => pose().angle,
          scaleX: () => (pose().scale * WHEEL.cardW) / el.offsetWidth,
          scaleY: () => (pose().scale * WHEEL.cardH) / el.offsetHeight,
          ease: "power2.inOut",
          duration: 0.3,
        }, 0.65);
      });

      // 80–90% WEBSITES leaves; 95–100% the hero turns transparent, revealing the Work wheel
      // underneath with its cards where the polaroids landed
      tl.to(q("[data-websites]"), { autoAlpha: 0, duration: 0.1 }, 0.8);
      tl.to([...polaroids, ...q("[data-hero-bg]:not([data-websites])")], { autoAlpha: 0, duration: 0.05 }, 0.95);
      // Once torn, nothing in the hero is clickable, and it (plus its pin-spacer) overlaps the pinned
      // wheel for a screen: let clicks through to the Work panel.
      const spacer = root.parentElement;
      if (spacer?.classList.contains("pin-spacer")) spacer.style.pointerEvents = "none";
      gsap.set(root, { pointerEvents: "auto" });
      tl.set(root, { pointerEvents: "none" }, RELEASE);



      return () => {
        gsap.ticker.remove(tick);
        halves.forEach((h) => {
          h.style.transform = "";
          h.style.visibility = "";
        });
        rip.style.filter = restShadow;
        setFibers(0);
      };
    });

    // Phones: one torn sheet slides up and away, no split, no pin.
    mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } })
        .to(q("[data-half]"), { yPercent: -70, rotation: -4, duration: 1 }, 0)
        .to(q("[data-polaroid]"), { y: -60, duration: 1 }, 0);
    });

    return () => mm.revert();
  }, [rootRef]);
}
