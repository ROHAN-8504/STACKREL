'use client';

// "use client": SPEC.md motion rule 10 allows one looping animation — the
// very slow hero gradient drift — but requires it to be "paused when
// off-screen". CSS cannot express that, so an IntersectionObserver toggles
// animation-play-state. No React state is involved, so scrolling never
// triggers a re-render.

import { useEffect, useRef } from 'react';

export function HeroGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.style.animationPlayState = entry?.isIntersecting ? 'running' : 'paused';
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hero-radial hero-glow pointer-events-none absolute inset-0 -z-10"
    />
  );
}
