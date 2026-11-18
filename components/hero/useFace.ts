"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

// Horizontal pupil travel only (the almond eyes have no vertical room). The pupils are drawn touching the
// inner corners, so each eye moves between there and its outer border, measured in the 1024px source:
// left eye has 45px free to its left, right eye 42px free to its right. GAP = closest screen px to the border.
const OUTER_ROOM = { l: -45, r: 42 };
const GAP = 2;

/**
 * Idle life: the eyes glance left / centre / right on their own; random blinks swap the eye frames and flick the curl.
 * Drives every [data-face] inside `ref` together (the hero paper is rendered twice for the rip).
 */
export function useFace(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const faces = [...(ref.current?.querySelectorAll<HTMLElement>("[data-face]") ?? [])];
    if (!faces.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pupil = (side: "l" | "r") => faces.flatMap((f) => [...f.querySelectorAll<HTMLElement>(`[data-pupil="${side}"]`)]);
    const pupils = [...pupil("l"), ...pupil("r")];
    const strands = faces.flatMap((f) => [...f.querySelectorAll<HTMLElement>("[data-strand]")]);
    const setEye = (state: string) => faces.forEach((f) => (f.dataset.eye = state));

    // t: 0 = looking left, 0.5 = centre, 1 = right. Eye saccades are quick, then the gaze holds.
    const look = (t: number) => {
      const s = faces[0].getBoundingClientRect().width / 1024;
      const tween = { duration: 0.22, ease: "power3.out", overwrite: true };
      gsap.to(pupil("l"), { x: Math.min(0, OUTER_ROOM.l * s + GAP) * (1 - t), ...tween }); // t=0: 2px from outer border
      gsap.to(pupil("r"), { x: Math.max(0, OUTER_ROOM.r * s - GAP) * t, ...tween }); // t=1: 2px from outer border
    };
    let gaze = 0.5;
    let lookTimer = 0;
    const wander = () => {
      lookTimer = window.setTimeout(() => {
        // Usually back to centre after a side glance; never the same spot twice in a row.
        gaze = gaze !== 0.5 && Math.random() < 0.6 ? 0.5 : gsap.utils.random([0, 0.5, 1].filter((g) => g !== gaze));
        look(gaze);
        wander();
      }, 1200 + Math.random() * 2300);
    };

    const blink = () => {
      gsap
        .timeline()
        .call(setEye, ["half"])
        .call(setEye, ["closed"], 0.04)
        .call(setEye, ["half"], 0.13)
        .call(setEye, ["open"], 0.18);
      // The brows drop on the blink and drag the curl; it springs back like a loose hair.
      gsap
        .timeline()
        .to(strands, { rotation: 9, yPercent: 0.5, duration: 0.09, ease: "power2.out", overwrite: true })
        .to(strands, { rotation: 0, yPercent: 0, duration: 1.1, ease: "elastic.out(1, 0.3)" });
    };

    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        blink();
        if (Math.random() < 0.2) timer = window.setTimeout(() => (blink(), schedule()), 260); // occasional double blink
        else schedule();
      }, 2200 + Math.random() * 3800);
    };

    look(gaze);
    wander();
    schedule();
    return () => {
      window.clearTimeout(lookTimer);
      window.clearTimeout(timer);
      gsap.killTweensOf([...pupils, ...strands]);
    };
  }, [ref]);
}
