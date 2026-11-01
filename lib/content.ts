import { lab, work, writing } from '#site/content';

/**
 * Single access point for the three MDX collections.
 *
 * SPEC.md § Content model: "drafts build locally, never in production".
 * The filter lives here rather than in the schema so `pnpm dev` still
 * renders drafts while a production build drops them.
 */

export type WorkEntry = (typeof work)[number];
export type WritingEntry = (typeof writing)[number];
export type LabEntry = (typeof lab)[number];
export type AnyEntry = WorkEntry | WritingEntry | LabEntry;

const SHOW_DRAFTS = process.env.NODE_ENV !== 'production';

function published<T extends { draft: boolean; date: string }>(items: readonly T[]): T[] {
  return items
    .filter((i) => SHOW_DRAFTS || !i.draft)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const allWork = (): WorkEntry[] => published(work);
export const allWriting = (): WritingEntry[] => published(writing);
export const allLab = (): LabEntry[] => published(lab);

export const workBySlug = (slug: string) => allWork().find((i) => i.slug === slug);
export const writingBySlug = (slug: string) => allWriting().find((i) => i.slug === slug);
export const labBySlug = (slug: string) => allLab().find((i) => i.slug === slug);

export const featuredWork = (): WorkEntry | undefined =>
  allWork().find((i) => i.featured) ?? allWork()[0];

/** Unique tags across a collection, most frequent first. */
export function tagsOf(items: readonly { tags: string[] }[]): string[] {
  const counts = new Map<string, number>();
  for (const i of items) for (const t of i.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

/**
 * Whether a nav item should appear. SPEC.md § Content model: "Hide a nav
 * item if its collection has zero published entries."
 */
export function collectionHasEntries(name: 'work' | 'writing' | 'lab'): boolean {
  const n = { work: allWork, writing: allWriting, lab: allLab }[name]().length;
  return n > 0;
}

/** Everything the command palette can jump to. */
export type SearchDoc = {
  href: string;
  title: string;
  summary: string;
  group: 'Work' | 'Writing' | 'Lab';
  tags: string[];
};

export function searchIndex(): SearchDoc[] {
  return [
    ...allWork().map((i) => ({
      href: i.permalink,
      title: i.title,
      summary: i.summary,
      group: 'Work' as const,
      tags: i.tags,
    })),
    ...allWriting().map((i) => ({
      href: i.permalink,
      title: i.title,
      summary: i.summary,
      group: 'Writing' as const,
      tags: i.tags,
    })),
    ...allLab().map((i) => ({
      href: i.permalink,
      title: i.title,
      summary: i.summary,
      group: 'Lab' as const,
      tags: i.tags,
    })),
  ];
}

/** Newest few items across writing and lab, for the landing strip. */
export function latestAcross(limit = 3): (SearchDoc & { date: string })[] {
  return [
    ...allWriting().map((i) => ({
      href: i.permalink,
      title: i.title,
      summary: i.summary,
      group: 'Writing' as const,
      tags: i.tags,
      date: i.date,
    })),
    ...allLab().map((i) => ({
      href: i.permalink,
      title: i.title,
      summary: i.summary,
      group: 'Lab' as const,
      tags: i.tags,
      date: i.date,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
