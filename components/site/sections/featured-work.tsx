import Link from 'next/link';

import { Reveal } from '@/components/site/reveal';
import { Section } from '@/components/site/sections/section';
import { SpotlightCard } from '@/components/site/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { featuredWork } from '@/lib/content';
import { FEATURED } from '@/lib/landing';

// SPEC.md § Landing page sections 4 — Featured work.
//
// Content comes from the `featured: true` entry in content/work, so editing
// that MDX file updates this card. The metrics array is whatever the entry
// declares; a value of TODO renders as an em dash rather than a made-up
// number.
export function FeaturedWork() {
  const entry = featuredWork();
  if (!entry) return null;

  const metrics =
    entry.metrics.length > 0
      ? entry.metrics
      : FEATURED.metrics.map((m) => ({ label: m.label, value: m.value ?? 'TODO' }));

  return (
    <Section label={FEATURED.label}>
      <Reveal>
        <SpotlightCard className="rounded-[var(--radius-card)]">
          <article className="border-border bg-bg-subtle hover:border-border-strong rounded-[var(--radius-card)] border p-8 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] sm:p-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-h1 text-fg">DesiStore</h3>
                <Badge variant="success">shipped</Badge>
              </div>

              <p className="text-body text-fg-muted max-w-prose">{entry.summary}</p>

              <dl className="border-border grid gap-6 border-t pt-8 sm:grid-cols-3">
                {metrics.map((m) => {
                  const pending =
                    m.value.trim().toUpperCase() === 'TODO' || m.value.trim() === '';
                  return (
                    <div key={m.label} className="flex flex-col gap-1">
                      <dt className="text-label text-fg-subtle font-mono uppercase">
                        {m.label}
                      </dt>
                      <dd className="text-h2 text-fg">
                        {pending ? (
                          <span className="text-fg-subtle" title="Not yet published">
                            —
                          </span>
                        ) : (
                          m.value
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={entry.permalink}
                  className="text-small text-fg underline-offset-4 hover:underline"
                >
                  Read the case study
                </Link>
                {entry.liveUrl ? (
                  <a
                    href={entry.liveUrl}
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
