export type Trigger<N extends string> = { at: number; dir: "down" | "up"; name: N };

/**
 * Fires each trigger once per crossing of its threshold, in its direction.
 * Guard: after anything fires at a threshold, that threshold stays quiet for `cooldownMs`
 * in both directions, so jitter around it doesn't machine-gun.
 */
export function crossingGuard<N extends string>(triggers: Trigger<N>[], cooldownMs = 250) {
  let prev: number | null = null;
  const lastAt = new Map<number, number>(); // threshold → time it last fired

  return (p: number, now: number, fire: (name: N) => void) => {
    if (prev !== null && p !== prev) {
      const dir = p > prev ? "down" : "up";
      for (const t of triggers) {
        if (t.dir !== dir) continue;
        const crossed = dir === "down" ? prev < t.at && p >= t.at : prev >= t.at && p < t.at;
        if (!crossed || now - (lastAt.get(t.at) ?? -Infinity) < cooldownMs) continue;
        lastAt.set(t.at, now);
        fire(t.name);
      }
    }
    prev = p;
  };
}
