"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { dragTilt, releaseFlips } from "@/lib/flip";

const PAD = 6; // track padding (px), must match AccessCard's p-1.5
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Arabic: the knob slides right → left and the card turns the other way.
const side = () => (document.dir === "rtl" ? -1 : 1);

/**
 * Swipe-to-flip: the knob drags along the track, the card tilts with it (up to 25° at 60%),
 * release past 60% completes the flip with a spring. Reduced motion: cross-fade instead of 3D.
 */
export function useFlip(cardRef: RefObject<HTMLDivElement | null>) {
  const knobRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const [flipped, setFlipped] = useState(false);
  const s = useRef({ p: 0, flipped: false, touched: false, justDragged: false, drag: null as null | { x0: number; p0: number; moved: boolean } }).current;
  const mounted = useRef(false);

  // The hidden face is inert, so move focus to the face that just turned up.
  useEffect(() => {
    if (!mounted.current) return void (mounted.current = true);
    (flipped ? backRef : knobRef).current?.focus({ preventScroll: true });
  }, [flipped]);

  const range = () => trackRef.current!.clientWidth - knobRef.current!.offsetWidth - PAD * 2;
  const label = () => trackRef.current!.querySelector("[data-slide-label]");

  function setKnob(p: number, spring?: string) {
    s.p = clamp01(p);
    const to = { x: side() * s.p * range() };
    if (spring) gsap.to(knobRef.current, { ...to, duration: 0.6, ease: spring });
    else gsap.set(knobRef.current, to);
    gsap.to(label(), { opacity: 1 - Math.min(s.p * 1.6, 1), duration: spring ? 0.3 : 0 });
  }

  function follow(p: number) {
    setKnob(p);
    if (!reduced()) gsap.set(cardRef.current, { rotateY: side() * dragTilt(s.p) });
  }

  function turn(toBack: boolean) {
    const card = cardRef.current;
    if (!card || s.flipped === toBack) return;
    s.flipped = toBack;
    s.touched = true;
    gsap.killTweensOf([card, knobRef.current]);
    setKnob(toBack ? 1 : 0, "power3.out");
    if (reduced()) {
      gsap.to(card.querySelector("[data-front]"), { opacity: toBack ? 0 : 1, duration: 0.35 });
      gsap.to(card.querySelector("[data-back]"), { opacity: toBack ? 1 : 0, duration: 0.35 });
    } else {
      gsap
        .timeline()
        .to(card, { rotateY: toBack ? side() * 180 : 0, duration: 0.9, ease: "back.out(1.5)" }, 0)
        .to(card, { z: 90, duration: 0.45, ease: "power2.out", yoyo: true, repeat: 1 }, 0) // lifts toward the viewer mid-flip
        // Shadow narrows and softens as the card goes edge-on and lifts, then settles back.
        .to(card.closest("[data-card-stage]")!.querySelector("[data-card-shadow]"), { scaleX: 0.5, opacity: 0.4, duration: 0.45, ease: "power2.out", yoyo: true, repeat: 1 }, 0);
    }
    setFlipped(toBack);
  }

  function release() {
    if (releaseFlips(s.p)) return turn(true);
    setKnob(0, "elastic.out(1, 0.55)");
    if (!reduced()) gsap.to(cardRef.current, { rotateY: 0, duration: 0.7, ease: "elastic.out(1, 0.6)" });
  }

  const knob = {
    onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
      if (s.flipped) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      gsap.killTweensOf([knobRef.current, cardRef.current]);
      s.touched = true;
      s.drag = { x0: e.clientX, p0: s.p, moved: false };
    },
    onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
      const d = s.drag;
      if (!d) return;
      const dx = side() * (e.clientX - d.x0);
      if (Math.abs(dx) > 3) d.moved = true;
      follow(d.p0 + dx / range());
    },
    onPointerUp() {
      const d = s.drag;
      s.drag = null;
      if (!d) return;
      s.justDragged = d.moved; // the click that follows a drag must not flip again
      if (d.moved) release();
    },
    onPointerCancel() {
      knob.onPointerUp();
    },
    // Enter/Space (and screen-reader activation) arrive as click.
    onClick() {
      if (s.justDragged) return void (s.justDragged = false);
      turn(true);
    },
    onKeyDown(e: React.KeyboardEvent) {
      const step = (e.key === "ArrowRight" ? 0.2 : e.key === "ArrowLeft" ? -0.2 : 0) * side();
      if (!step) return;
      e.preventDefault();
      s.touched = true;
      if (s.p + step >= 1 - 1e-6) return turn(true);
      follow(s.p + step);
    },
  };

  /** Scroll hint: nudge the knob right twice, unless the visitor already touched it. */
  function nudge() {
    if (s.touched || s.flipped || reduced()) return;
    gsap.to(knobRef.current, { x: side() > 0 ? "+=12" : "-=12", duration: 0.22, ease: "power1.inOut", yoyo: true, repeat: 3 });
  }

  return { flipped, knobRef, trackRef, backRef, knob, flipBack: () => turn(false), nudge };
}
