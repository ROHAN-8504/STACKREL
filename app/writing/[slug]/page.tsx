import { notFound } from 'next/navigation';

import { MDXContent } from '@/components/mdx/mdx-content';
import { TableOfContents } from '@/components/site/toc';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/site/json-ld';
import { allWriting, formatDate, writingBySlug } from '@/lib/content';
import { articleLd, breadcrumbLd, pageMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return allWriting().map((i) => ({ slug: i.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = writingBySlug(slug);
  if (!entry) return {};
  return pageMetadata({
    title: entry.title,
    description: entry.summary,
    path: entry.permalink,
    type: 'article',
    publishedTime: entry.date,
    modifiedTime: entry.updated,
    tags: entry.tags,
  });
}

export default async function WritingEntryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = writingBySlug(slug);
  if (!entry) notFound();

  return (
    <article className="container-content pt-20 pb-24">
      <JsonLd
        data={[
          articleLd({
            title: entry.title,
            description: entry.summary,
            path: entry.permalink,
            datePublished: entry.date,
            dateModified: entry.updated,
            tags: entry.tags,
          }),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Writing', path: '/writing' },
            { name: entry.title, path: entry.permalink },
          ]),
        ]}
      />
      <header className="border-border flex flex-col gap-4 border-b pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{entry.kind}</Badge>
          <time dateTime={entry.date} className="text-small text-fg-subtle">
            {formatDate(entry.date)}
          </time>
          <span className="text-small text-fg-subtle">
            {entry.metadata.readingTime} min read
          </span>
          {entry.series ? (
            <span className="text-small text-fg-subtle">Series: {entry.series}</span>
          ) : null}
        </div>
        <h1 className="text-h1 text-fg max-w-[22ch]">{entry.title}</h1>
        <p className="text-body text-fg-muted max-w-prose">{entry.summary}</p>
        {entry.tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {entry.tags.map((t) => (
              <li key={t}>
                <Badge>{t}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="max-w-prose min-w-0 flex-1">
          <MDXContent code={entry.body} />
        </div>
        <aside className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0">
          <TableOfContents items={entry.toc} />
        </aside>
      </div>
    </article>
  );
}
