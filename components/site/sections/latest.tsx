import Link from 'next/link';

import { Reveal } from '@/components/site/reveal';
import { Section } from '@/components/site/sections/section';
import { LATEST } from '@/lib/landing';

// SPEC.md § Landing page sections 6 — From the lab and the writing: latest
// 3 items, pulled from MDX automatically.
//
// The MDX collections land in Phase 4. Until then this renders an honest
// empty state rather than invented article titles, which would be
// indistinguishable from real posts.
export function Latest() {
  const items: { href: string; title: string; kind: string; date: string }[] = [];

  return (
    <Section label={LATEST.label} heading={LATEST.heading}>
      {items.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal as="li" key={item.href} index={i}>
              <Link href={item.href} className="block">
                {item.title}
              </Link>
            </Reveal>
          ))}
        </ul>
      ) : (
        <Reveal>
          <div className="border-border bg-bg-subtle/40 rounded-[var(--radius-card)] border border-dashed px-8 py-12">
            <p className="text-body text-fg-muted max-w-prose">{LATEST.empty}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/writing"
                className="text-small text-fg underline-offset-4 hover:underline"
              >
                Writing
              </Link>
              <Link
                href="/lab"
                className="text-small text-fg underline-offset-4 hover:underline"
              >
                Lab
              </Link>
            </div>
          </div>
        </Reveal>
      )}
    </Section>
  );
}
