import type { MetadataRoute } from 'next';

import { allLab, allWork, allWriting } from '@/lib/content';
import { SITE } from '@/lib/site';

// SPEC.md § SEO: sitemap generated from content; drafts excluded.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/work',
    '/writing',
    '/lab',
    '/open-source',
    '/about',
    '/contact',
  ];

  const entries = [...allWork(), ...allWriting(), ...allLab()];

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE.url}${r}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: r === '' ? 1 : 0.7,
    })),
    ...entries.map((e) => ({
      url: `${SITE.url}${e.permalink}`,
      lastModified: new Date(e.updated ?? e.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
