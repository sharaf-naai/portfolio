"use client";

import { useEffect, type RefObject } from "react";

type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * The hologram "catches the light": writes --hx / --hy (background position) and --ha (gradient angle)
 * on the card from the pointer (desktop) or the device tilt (mobile, where permitted).
 */
export function useHologram(cardRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const set = (rx: number, ry: number) => {
      const x = Math.min(Math.max(rx, 0), 1);
      const y = Math.min(Math.max(ry, 0), 1);
      card.style.setProperty("--hx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--hy", `${(y * 100).toFixed(1)}%`);
      card.style.setProperty("--ha", `${(90 + x * 60).toFixed(1)}deg`);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    const onTilt = (e: DeviceOrientationEvent) => set(((e.gamma ?? 0) + 45) / 90, (e.beta ?? 45) / 90);
    const listenTilt = () => window.addEventListener("deviceorientation", onTilt);

    card.addEventListener("pointermove", onPointer);
    const DOE = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined;
    // iOS asks for permission, and only from a tap; elsewhere tilt events just arrive.
    const ask = () => DOE?.requestPermission?.().then((s) => s === "granted" && listenTilt(), () => {});
    if (DOE && !DOE.requestPermission) listenTilt();
    else card.addEventListener("pointerdown", ask, { once: true });

    return () => {
      card.removeEventListener("pointermove", onPointer);
      card.removeEventListener("pointerdown", ask);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [cardRef]);
}
