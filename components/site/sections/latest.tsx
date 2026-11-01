import Link from 'next/link';

import { EntryCard } from '@/components/site/entry-card';
import { Reveal } from '@/components/site/reveal';
import { Section } from '@/components/site/sections/section';
import { latestAcross } from '@/lib/content';
import { LATEST } from '@/lib/landing';

// SPEC.md § Landing page sections 6 — latest 3 items, pulled from MDX
// automatically. Adding one .mdx file changes this list with no code change.
export function Latest() {
  const items = latestAcross(3);

  return (
    <Section label={LATEST.label} heading={LATEST.heading}>
      {items.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal as="li" key={item.href} index={i} className="relative">
              <EntryCard
                href={item.href}
                title={item.title}
                summary={item.summary}
                date={item.date}
                badge={{ label: item.group, variant: 'default' }}
              />
            </Reveal>
          ))}
        </ul>
      ) : (
        <Reveal>
          <div className="border-border bg-bg-subtle/40 rounded-[var(--radius-card)] border border-dashed px-8 py-12">
            <p className="text-body text-fg-muted max-w-prose">{LATEST.empty}</p>
          </div>
        </Reveal>
      )}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/writing"
          className="text-small text-fg underline-offset-4 hover:underline"
        >
          All writing
        </Link>
        <Link
          href="/lab"
          className="text-small text-fg underline-offset-4 hover:underline"
        >
          All experiments
        </Link>
      </div>
    </Section>
  );
}
