import type { Metadata } from 'next';

import { SITE } from '@/lib/site';

/**
 * Metadata helpers — SPEC.md § SEO.
 *
 * Every route gets a canonical URL, a description, and Open Graph plus
 * Twitter card data. The images themselves are generated per route by the
 * opengraph-image.tsx files (Phase 4).
 */

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
}: {
  title: string;
  description: string;
  /** Route path, with a leading slash. */
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: SITE.name,
      title,
      description,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(tags ? { tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/* ------------------------------------------------------------------ JSON-LD
 * Rendered as a <script type="application/ld+json">. The content is our own,
 * built from typed objects and serialised with JSON.stringify, so there is
 * no injection path from external input (SPEC.md § Content and output
 * safety). `<` is escaped so the payload cannot close the script element.
 */

export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  description:
    'AI engineering agency. We design, ship and maintain AI agents, LLM applications and the backends behind them.',
  email: SITE.email,
  logo: `${SITE.url}/icon.svg`,
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
});

export const articleLd = (a: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string | undefined;
  tags?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.description,
  url: `${SITE.url}${a.path}`,
  mainEntityOfPage: `${SITE.url}${a.path}`,
  image: `${SITE.url}${a.path}/opengraph-image`,
  datePublished: a.datePublished,
  dateModified: a.dateModified ?? a.datePublished,
  author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  ...(a.tags?.length ? { keywords: a.tags.join(', ') } : {}),
});

export const creativeWorkLd = (w: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  client?: string;
  stack?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: w.title,
  description: w.description,
  url: `${SITE.url}${w.path}`,
  image: `${SITE.url}${w.path}/opengraph-image`,
  datePublished: w.datePublished,
  creator: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  ...(w.client
    ? { sourceOrganization: { '@type': 'Organization', name: w.client } }
    : {}),
  ...(w.stack?.length ? { keywords: w.stack.join(', ') } : {}),
});

export const breadcrumbLd = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE.url}${item.path}`,
  })),
});
