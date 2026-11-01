import Link from 'next/link';

import { Reveal } from '@/components/site/reveal';
import { buttonVariants } from '@/components/ui/button';
import { CTA } from '@/lib/landing';

// SPEC.md § Landing page sections 8 — CTA band.
export function CtaBand() {
  return (
    <section className="container-content py-24">
      <Reveal>
        <div className="border-border bg-bg-subtle relative overflow-hidden rounded-[var(--radius-card)] border px-8 py-16 text-center sm:px-16">
          {/* The grid utility sets mask-image, which masks an element's
              children as well as its background, so it must live on its own
              absolutely positioned layer rather than on a content container. */}
          <div
            aria-hidden="true"
            className="bg-grid pointer-events-none absolute inset-0"
          />
          <div className="relative flex flex-col items-center gap-4">
            <h2 className="text-h1 text-fg max-w-[18ch]">{CTA.heading}</h2>
            <p className="text-body text-fg-muted max-w-prose">{CTA.sub}</p>
            <Link
              href={CTA.action.href}
              className={`${buttonVariants({ variant: 'primary', size: 'lg' })} mt-2`}
            >
              {CTA.action.label}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
