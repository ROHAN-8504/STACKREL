import Link from 'next/link';

import { HeroGlow } from '@/components/site/hero-glow';
import { buttonVariants } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { HERO } from '@/lib/landing';

// SPEC.md § Landing page sections 2 — Hero: one-line positioning, one
// sub-line, two buttons, grid-line background with a faint radial glow.
// Server Component: the entrance is a pure CSS animation (motion rule 4).
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-20"
      />
      <HeroGlow />

      <div className="container-content flex flex-col items-start gap-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
        <div
          className="hero-item"
          style={{ '--hero-delay': '0ms' } as React.CSSProperties}
        >
          <SectionLabel>{HERO.label}</SectionLabel>
        </div>

        <h1
          className="hero-item--lcp text-display text-fg max-w-[16ch]"
          style={{ '--hero-delay': '80ms' } as React.CSSProperties}
        >
          {HERO.headline}
        </h1>

        <p
          className="hero-item text-body text-fg-muted max-w-prose"
          style={{ '--hero-delay': '200ms' } as React.CSSProperties}
        >
          {HERO.sub}
        </p>

        <div
          className="hero-item mt-2 flex flex-wrap items-center gap-3"
          style={{ '--hero-delay': '320ms' } as React.CSSProperties}
        >
          <Link
            href={HERO.primary.href}
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            {HERO.primary.label}
          </Link>
          <Link
            href={HERO.secondary.href}
            className={buttonVariants({ variant: 'secondary', size: 'lg' })}
          >
            {HERO.secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
