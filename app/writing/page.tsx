import { EntryCard } from '@/components/site/entry-card';
import { PageHeader } from '@/components/site/page-header';
import { TagFilter } from '@/components/site/tag-filter';
import { allWriting, tagsOf } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Writing',
  description:
    'Write-ups, breakdowns and learnings from building AI systems in production.',
  path: '/writing',
});

export default function WritingPage() {
  const items = allWriting();

  return (
    <div className="container-content pb-24">
      <PageHeader
        label="Writing"
        title="Write-ups and breakdowns"
        intro="What we learned building things, written down while it is still fresh."
      />
      {items.length === 0 ? (
        <p className="text-body text-fg-muted">Nothing published yet.</p>
      ) : (
        <TagFilter
          tags={tagsOf(items)}
          items={items.map((i) => ({
            slug: i.slug,
            title: i.title,
            summary: i.summary,
            tags: i.tags,
            node: (
              <EntryCard
                href={i.permalink}
                title={i.title}
                summary={i.summary}
                date={i.date}
                meta={`${i.metadata.readingTime} min read`}
                badge={{ label: i.kind, variant: 'default' }}
                tags={i.tags}
              />
            ),
          }))}
        />
      )}
    </div>
  );
}
