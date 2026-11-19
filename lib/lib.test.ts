// Run: node --test lib/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stickSlip, tipAt, fiberPoints, basePose, RIP } from "./rip.ts";
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

test("active card sits at 0° to the right of the panel", () => {
  const p = cardPose(0, 0, 1440, 960);
  assert.equal(p.angle, 0);
  assert.equal(p.x, 850);
  assert.equal(p.y, 480);
});

test("Arabic wheel is the mirror image", () => {
  const ltr = cardPose(2, 0.5, 1440, 960);
  const rtl = cardPose(2, 0.5, 1440, 960, -1);
  assert.equal(rtl.x, 1440 - ltr.x);
  assert.equal(rtl.y, ltr.y);
  assert.equal(rtl.angle, -ltr.angle);
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

test("pricing: band labels and WhatsApp message come from the locale's copy", () => {
  const en = JSON.parse(readFileSync("messages/en.json", "utf8")).services;
  const ar = JSON.parse(readFileSync("messages/ar.json", "utf8")).services;
  const b = bands([1800, 3500, 7000], "GBP", en);
  assert.deepEqual(b, ["Under 1,800 GBP", "1,800 – 3,500 GBP", "3,500 – 7,000 GBP", "7,000+ GBP"]);
  assert.equal(
    briefMessage(en.whatsapp, { need: en.needs.website, addons: [en.addons.booking.name, en.addons.lang.name], budget: b[1], time: en.timing.soon, country: "GB" }),
    "Hi! I'd like a website + booking system + extra language. Budget: 1,800–3,500 GBP. Timeline: 1–2 months. [GB]",
  );
  assert.equal(briefMessage(en.whatsapp, { need: en.needs.crm, addons: [], budget: "x", time: "y", country: "MA" }).includes("a CRM."), true);
  // Arabic wording, Western digits
  assert.match(bands([8000, 15000, 30000], "MAD", ar, "ar")[0], /^أقل من 8[,.٬]?000 MAD$/);
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
