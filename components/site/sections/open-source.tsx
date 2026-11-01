import Link from 'next/link';

import { Reveal } from '@/components/site/reveal';
import { Section } from '@/components/site/sections/section';
import { OPEN_SOURCE } from '@/lib/landing';

// SPEC.md § Landing page sections 7 — Open source: a strip of repo cards.
// Cards are built from the GitHub API at build time in Phase 4; until then
// this is an honest empty state rather than invented repositories.
export function OpenSource() {
  const repos: { name: string; description: string; stars: number }[] = [];

  return (
    <Section label={OPEN_SOURCE.label} heading={OPEN_SOURCE.heading}>
      {repos.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-3">
          {repos.map((repo, i) => (
            <Reveal as="li" key={repo.name} index={i}>
              {repo.name}
            </Reveal>
          ))}
        </ul>
      ) : (
        <Reveal>
          <div className="border-border bg-bg-subtle/40 rounded-[var(--radius-card)] border border-dashed px-8 py-12">
            <p className="text-body text-fg-muted max-w-prose">{OPEN_SOURCE.empty}</p>
            <Link
              href="/open-source"
              className="text-small text-fg mt-6 inline-block underline-offset-4 hover:underline"
            >
              Open source
            </Link>
          </div>
        </Reveal>
      )}
    </Section>
  );
}
