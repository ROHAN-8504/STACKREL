import { notFound } from 'next/navigation';

import { MDXContent } from '@/components/mdx/mdx-content';
import { TableOfContents } from '@/components/site/toc';
import { Badge } from '@/components/ui/badge';
import { allLab, formatDate, labBySlug } from '@/lib/content';

type Params = Promise<{ slug: string }>;

const STATUS = { running: 'warning', shipped: 'success', killed: 'error' } as const;

export function generateStaticParams() {
  return allLab().map((i) => ({ slug: i.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = labBySlug(slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: entry.permalink },
  };
}

export default async function LabEntryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = labBySlug(slug);
  if (!entry) notFound();

  return (
    <article className="container-content pt-20 pb-24">
      <header className="border-border flex flex-col gap-4 border-b pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={STATUS[entry.status]}>{entry.status}</Badge>
          <time dateTime={entry.startedAt} className="text-small text-fg-subtle">
            Started {formatDate(entry.startedAt)}
          </time>
          {entry.endedAt ? (
            <time dateTime={entry.endedAt} className="text-small text-fg-subtle">
              Ended {formatDate(entry.endedAt)}
            </time>
          ) : null}
        </div>
        <h1 className="text-h1 text-fg max-w-[22ch]">{entry.title}</h1>

        <dl className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <dt className="text-label text-fg-subtle font-mono uppercase">Hypothesis</dt>
            <dd className="text-body text-fg-muted max-w-prose">{entry.hypothesis}</dd>
          </div>
          {entry.result ? (
            <div className="flex flex-col gap-1.5">
              <dt className="text-label text-fg-subtle font-mono uppercase">Result</dt>
              <dd className="text-body text-fg-muted max-w-prose">{entry.result}</dd>
            </div>
          ) : null}
        </dl>
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
