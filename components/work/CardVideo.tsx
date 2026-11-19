"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src?: string;
  poster?: string;
  shot: string; // placeholder gradient until the real video exists
  label: string;
  placeholderText: string;
  /** Wheel mode: parent decides. Stack mode (`stack`): IntersectionObserver decides. */
  playing: boolean;
  load: boolean;
  stack: boolean;
};

export default function CardVideo({ src, poster, shot, label, placeholderText, playing, load, stack }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  // Stack mode: attach the source when within a screen, play when half visible.
  useEffect(() => {
    const el = video.current;
    if (!stack || !el) return;
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const viewIO = new IntersectionObserver(([e]) => setVisible(e.intersectionRatio >= 0.5), { threshold: [0, 0.5] });
    nearIO.observe(el);
    viewIO.observe(el);
    return () => {
      nearIO.disconnect();
      viewIO.disconnect();
    };
  }, [stack, src]);

  const shouldLoad = stack ? near : load;
  const shouldPlay = shouldLoad && (stack ? visible : playing);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (shouldPlay) el.play().catch(() => {}); // autoplay can still be refused (e.g. data saver)
    else el.pause();
  }, [shouldPlay]);

  if (!src) {
    return (
      <div role="img" aria-label={label} className="relative h-full min-h-40 overflow-hidden rounded-lg" style={{ background: shot }}>
        <span className="label-mono absolute bottom-2.5 start-2.5 rounded-[3px] bg-black/55 px-1.5 py-1 text-[10px] tracking-[0.12em] text-[#F2EFE9]">
          {placeholderText}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-40 overflow-hidden rounded-lg" style={{ background: shot }}>
      <video
        ref={video}
        src={shouldLoad ? src : undefined}
        poster={poster}
        aria-label={label}
        muted
        playsInline
        loop
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (bar.current && v.duration) bar.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
        }}
      />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
        <span ref={bar} className="block h-full w-0 bg-bone" />
      </span>
    </div>
  );
}
