'use client';

// "use client": the only interactive part of the header is its scrolled
// state, which comes from an IntersectionObserver watching an 8px sentinel
// (SPEC.md § Perceived-speed requirements: "a CSS class toggled by an
// IntersectionObserver sentinel, not a scroll listener").
//
// Everything inside the header — wordmark, nav links, CTA — is passed in as
// children from a Server Component, so that markup never ships as client JS.

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function HeaderChrome({ children }: { children: ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!(entry?.isIntersecting ?? true)),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Absolute, so the sentinel costs no layout and cannot shift content. */}
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-2 w-px"
      />
      <header
        className={cn(
          'sticky top-0 z-[var(--z-header)] w-full',
          'transition-[background-color,border-color,backdrop-filter]',
          'duration-[var(--dur-fast)] ease-[var(--ease-out)]',
          scrolled
            ? 'border-border border-b bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        {children}
      </header>
    </>
  );
}
