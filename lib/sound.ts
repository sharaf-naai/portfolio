import type { Howl } from "howler";

export type SoundName = "tapePeel" | "rip1" | "rip2" | "rip3" | "rustle" | "whoosh" | "tick" | "click" | "cardFlip" | "scratch";

// Sprite map [offset ms, duration ms]. shortcut: placeholder timings, set them when the real sprite is cut.
const SPRITE: Record<SoundName, [number, number]> = {
  tapePeel: [0, 700],
  rip1: [1000, 450],
  rip2: [2000, 450],
  rip3: [3000, 600],
  rustle: [4000, 700],
  whoosh: [5000, 800],
  tick: [8000, 80],
  click: [9000, 80],
  cardFlip: [10000, 700],
  scratch: [6000, 250], // pencil scratch when sound turns on
};

const KEY = "sound";
let howl: Howl | null = null;
let enabled = false;

/** The visitor's saved choice from an earlier visit. Sound never starts on its own otherwise. */
export function soundPref() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

/** Turn sound on/off and remember it. Howler (and its AudioContext) loads only on the first "on". */
export async function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  if (on && !howl) {
    const { Howl, Howler } = await import("howler");
    Howler.volume(0.35);
    howl = new Howl({ src: ["/assets/sounds/sprite.webm", "/assets/sounds/sprite.mp3"], sprite: SPRITE });
    const sync = () => Howler.mute(document.hidden);
    document.addEventListener("visibilitychange", sync);
    sync();
  }
  if (!on) {
    howl?.stop();
  }
}

/** Play a sound if enabled. `volume` 0–1 on top of the master volume. */
export function play(name: SoundName, volume = 1) {
  if (!enabled || !howl) return;
  const id = howl.play(name);
  howl.volume(volume, id);
}
