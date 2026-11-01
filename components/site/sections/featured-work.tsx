import Link from 'next/link';

import { Reveal } from '@/components/site/reveal';
import { Section } from '@/components/site/sections/section';
import { SpotlightCard } from '@/components/site/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { FEATURED } from '@/lib/landing';

// SPEC.md § Landing page sections 4 — Featured work: DesiStore as a large
// card with a short problem statement and 2–3 numbers.
//
// The numbers are deliberately unfilled. Rohan has not supplied real
// metrics, and inventing them would put a false claim on the page, so each
// slot renders its label with an em dash until the real figure arrives.
export function FeaturedWork() {
  return (
    <Section label={FEATURED.label}>
      <Reveal>
        <SpotlightCard className="rounded-[var(--radius-card)]">
          <article className="border-border bg-bg-subtle hover:border-border-strong rounded-[var(--radius-card)] border p-8 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] sm:p-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-h1 text-fg">{FEATURED.heading}</h3>
                <Badge variant="success">shipped</Badge>
              </div>

              <p className="text-body text-fg-muted max-w-prose">{FEATURED.summary}</p>

              <dl className="border-border grid gap-6 border-t pt-8 sm:grid-cols-3">
                {FEATURED.metrics.map((m) => (
                  <div key={m.label} className="flex flex-col gap-1">
                    <dt className="text-label text-fg-subtle font-mono uppercase">
                      {m.label}
                    </dt>
                    <dd
                      className="text-h2 text-fg"
                      // Screen readers should not announce a bare dash as a value.
                      aria-label={m.value ? undefined : `${m.label}: not yet published`}
                    >
                      {m.value ?? <span className="text-fg-subtle">—</span>}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={FEATURED.href}
                  className="text-small text-fg underline-offset-4 hover:underline"
                >
                  Read the case study
                </Link>
                {FEATURED.liveUrl ? (
                  <a
                    href={FEATURED.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-small text-fg-muted hover:text-fg underline-offset-4 hover:underline"
                  >
                    Live API
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        </SpotlightCard>
      </Reveal>
    </Section>
  );
}
