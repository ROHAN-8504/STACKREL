import { notFound } from 'next/navigation';

import { MDXContent } from '@/components/mdx/mdx-content';
import { TableOfContents } from '@/components/site/toc';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/site/json-ld';
import { allWork, formatDate, workBySlug } from '@/lib/content';
import { breadcrumbLd, creativeWorkLd, pageMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return allWork().map((i) => ({ slug: i.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = workBySlug(slug);
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

export default async function WorkEntryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = workBySlug(slug);
  if (!entry) notFound();

  return (
    <article className="container-content pt-20 pb-24">
      <JsonLd
        data={[
          creativeWorkLd({
            title: entry.title,
            description: entry.summary,
            path: entry.permalink,
            datePublished: entry.date,
            client: entry.client,
            stack: entry.stack,
          }),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work' },
            { name: entry.title, path: entry.permalink },
          ]),
        ]}
      />
      <header className="border-border flex flex-col gap-4 border-b pb-10">
        <p className="text-label text-fg-subtle font-mono uppercase">{entry.client}</p>
        <h1 className="text-h1 text-fg max-w-[22ch]">{entry.title}</h1>
        <p className="text-body text-fg-muted max-w-prose">{entry.summary}</p>

        <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
          <Meta label="Date">
            <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          </Meta>
          {entry.role ? <Meta label="Role">{entry.role}</Meta> : null}
          {entry.stack.length > 0 ? (
            <Meta label="Stack">
              <span className="flex flex-wrap gap-2">
                {entry.stack.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </span>
            </Meta>
          ) : null}
        </dl>

        {entry.liveUrl || entry.repoUrl ? (
          <div className="mt-2 flex flex-wrap gap-4">
            {entry.liveUrl ? (
              <a
                href={entry.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-fg underline underline-offset-4"
              >
                Live
              </a>
            ) : null}
            {entry.repoUrl ? (
              <a
                href={entry.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-fg underline underline-offset-4"
              >
                Repository
              </a>
            ) : null}
          </div>
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

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-label text-fg-subtle font-mono uppercase">{label}</dt>
      <dd className="text-small text-fg-muted">{children}</dd>
    </div>
  );
}
