import { EntryCard } from '@/components/site/entry-card';
import { PageHeader } from '@/components/site/page-header';
import { TagFilter } from '@/components/site/tag-filter';
import { allLab, tagsOf } from '@/lib/content';

export const metadata = {
  title: 'Lab',
  description: 'Experiments run on Stackrel: the hypothesis, the method and the result.',
};

const STATUS = {
  running: 'warning',
  shipped: 'success',
  killed: 'error',
} as const;

export default function LabPage() {
  const items = allLab();

  return (
    <div className="container-content pb-24">
      <PageHeader
        label="Lab"
        title="Experiments"
        intro="Questions worth testing, run in the open. Some ship, some get killed; both get written up."
      />
      {items.length === 0 ? (
        <p className="text-body text-fg-muted">No experiments published yet.</p>
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
                badge={{ label: i.status, variant: STATUS[i.status] }}
                tags={i.tags}
              />
            ),
          }))}
        />
      )}
    </div>
  );
}
