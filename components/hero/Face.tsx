const SRC = "/assets/images/portrait-variants/";
const layer = "absolute inset-0 size-full select-none";
const MASK = `url(${SRC}eyes-mask.png)`;

/** Ink portrait frames, stacked and sized by font-size; `data-eye` picks the visible frame. Animated by useFace. */
export default function Face({ className = "" }: { className?: string }) {
  return (
    <span data-face data-eye="open" aria-hidden="true" className={`face relative inline-block ${className}`}>
      {/* eslint-disable @next/next/no-img-element -- tiny frames that must all be loaded for instant swaps */}
      {/* Paper-coloured head silhouette: the face covers whatever sits behind it. */}
      <img src={`${SRC}fill.png`} alt="" draggable={false} className={layer} />
      <img src={`${SRC}open.png`} alt="" draggable={false} className={`${layer} face-open`} />
      <img src={`${SRC}half.png`} alt="" draggable={false} className={`${layer} face-half`} />
      <img src={`${SRC}closed.png`} alt="" draggable={false} className={`${layer} face-closed`} />
      {/* Full round pupils slide behind a fixed mask of the eye openings, so the lids always cover their tops.
          Same image twice, clipped to one eye each, so each eye gets its own travel range. */}
      <span className={`${layer} face-open`} style={{ maskImage: MASK, WebkitMaskImage: MASK, maskSize: "100%", WebkitMaskSize: "100%" }}>
        <img data-pupil="l" src={`${SRC}pupils.png`} alt="" draggable={false} className={layer} style={{ clipPath: "inset(0 50% 0 0)" }} />
        <img data-pupil="r" src={`${SRC}pupils.png`} alt="" draggable={false} className={layer} style={{ clipPath: "inset(0 0 0 50%)" }} />
      </span>
      {/* Origin = where the curl leaves the hairline (strand bbox x 512–584, y 340 of 1024). */}
      <img data-strand src={`${SRC}strand.png`} alt="" draggable={false} className={layer} style={{ transformOrigin: "53.5% 33.4%" }} />
    </span>
  );
}
