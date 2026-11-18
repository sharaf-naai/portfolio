// Run: node --test lib/
import { test } from "node:test";
import assert from "node:assert/strict";
import { stickSlip, tipAt, fiberPoints, basePose, RIP } from "./rip.ts";
import { crossingGuard } from "./crossings.ts";
import { cardPose } from "./wheel.ts";
import { nice, edges, bands, detectCountry, briefMessage, FALLBACK_RATES } from "./pricing.ts";

test("stickSlip is monotonic, 0→1, with plateaus", () => {
  let prev = -1;
  for (let i = 0; i <= 1000; i++) {
    const v = stickSlip(i / 1000);
    assert.ok(v >= prev - 1e-12, `not monotonic at ${i}`);
    prev = v;
  }
  assert.equal(stickSlip(0), 0);
  assert.equal(stickSlip(1), 1);
  assert.equal(stickSlip(0.18), stickSlip(0.19)); // inside the first plateau
});

test("tear tip runs bottom → top along the rip", () => {
  assert.equal(tipAt(0).y, 100);
  assert.equal(tipAt(1).y, 0);
  assert.equal(tipAt(1).x, RIP[0][0]);
  assert.equal(fiberPoints(0), "");
  assert.equal(fiberPoints(1).split(" ").length, RIP.length);
});

test("halves start at rest and open a wedge", () => {
  const l0 = basePose(0, "left");
  assert.deepEqual([l0.x, l0.y, l0.rz].map((v) => v + 0), [0, 0, 0]); // +0 folds -0
  assert.ok(basePose(0.3, "left").rz > 0 && basePose(0.3, "right").rz < 0);
});

test("crossing guard fires once per crossing, by direction", () => {
  const fired: string[] = [];
  const update = crossingGuard([
    { at: 0.25, dir: "down", name: "rip1" },
    { at: 0.25, dir: "up", name: "rustle" },
  ]);
  const step = (p: number, t: number) => update(p, t, (n) => fired.push(n));
  step(0.2, 0);
  step(0.3, 10); // down → rip1
  step(0.31, 20); // no crossing
  step(0.2, 30); // jitter back up within cooldown → quiet
  step(0.3, 50); // and down again → quiet
  step(0.2, 400); // real scroll up → rustle
  step(0.3, 800); // real scroll down → rip1
  assert.deepEqual(fired, ["rip1", "rustle", "rip1"]);

  const solo: string[] = [];
  const u2 = crossingGuard([{ at: 0.5, dir: "down", name: "x" }]);
  u2(0.4, 0, (n) => solo.push(n));
  u2(0.6, 0, (n) => solo.push(n));
  u2(0.4, 10, (n) => solo.push(n));
  u2(0.6, 20, (n) => solo.push(n)); // same trigger within cooldown → suppressed
  u2(0.4, 400, (n) => solo.push(n));
  u2(0.6, 500, (n) => solo.push(n));
  assert.deepEqual(solo, ["x", "x"]);
});

test("active card sits at 0° to the right of the panel", () => {
  const p = cardPose(0, 0, 1440, 960);
  assert.equal(p.angle, 0);
  assert.equal(p.x, 850);
  assert.equal(p.y, 480);
});

test("pricing: 2 significant figures", () => {
  assert.equal(nice(744), 740);
  assert.equal(nice(1512), 1500);
  assert.equal(nice(420), 420);
});

test("pricing: country picks the ranges, currency only converts them", () => {
  const r = { ...FALLBACK_RATES, MAD: 10, EUR: 1 };
  assert.deepEqual(edges("MA", "website", "MAD", r), [8000, 15000, 30000]);
  assert.deepEqual(edges("MA", "crm", "MAD", r), [20000, 38000, 75000]); // ×2.5, rounded
  assert.deepEqual(edges("MA", "website", "EUR", r), [800, 1500, 3000]); // Moroccan ranges, shown in euros
  assert.notDeepEqual(edges("MA", "website", "EUR", r), edges("FR", "website", "EUR", r));
  assert.deepEqual(edges("KW", "automation", "KWD", r), [420, 840, 1700]);
});

test("pricing: band labels and WhatsApp message", () => {
  const b = bands([1800, 3500, 7000], "GBP");
  assert.deepEqual(b, ["Under 1,800 GBP", "1,800 – 3,500 GBP", "3,500 – 7,000 GBP", "7,000+ GBP"]);
  assert.equal(
    briefMessage({ need: "a website", addons: ["booking system", "extra language"], budget: b[1], time: "1–2 months", country: "GB" }),
    "Hi! I'd like a website + booking system + extra language. Budget: 1,800–3,500 GBP. Timeline: 1–2 months. [GB]",
  );
});

test("pricing: detection order cookie → timezone → OTHER", () => {
  assert.equal(detectCountry("a=1; country=FR", "Africa/Casablanca"), "FR");
  assert.equal(detectCountry("country=ZZ", "Africa/Casablanca"), "MA"); // unknown cookie value ignored
  assert.equal(detectCountry("", "Asia/Tokyo"), "OTHER");
  assert.equal(detectCountry("", undefined), "OTHER");
});

import { dragTilt, releaseFlips, MAX_TILT } from "./flip.ts";

test("card tilt follows the knob up to 60%, release flips only past it", () => {
  assert.equal(dragTilt(0), 0);
  assert.equal(dragTilt(0.3), MAX_TILT / 2);
  assert.equal(dragTilt(0.6), MAX_TILT);
  assert.equal(dragTilt(1), MAX_TILT);
  assert.equal(dragTilt(-1), 0);
  assert.equal(releaseFlips(0.59), false);
  assert.equal(releaseFlips(0.6), true);
});
