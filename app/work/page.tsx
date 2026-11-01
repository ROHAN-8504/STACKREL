import { EntryCard } from '@/components/site/entry-card';
import { PageHeader } from '@/components/site/page-header';
import { allWork } from '@/lib/content';

export const metadata = {
  title: 'Work',
  description:
    'Case studies: the problem, the architecture, the decisions and the results.',
};

export default function WorkPage() {
  const items = allWork();

  return (
    <div className="container-content pb-24">
      <PageHeader
        label="Work"
        title="Case studies"
        intro="What the problem was, how it was built, and what happened after it shipped."
      />
      {items.length === 0 ? (
        <p className="text-body text-fg-muted">No case studies published yet.</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map((i) => (
            <li key={i.slug} className="relative">
              <EntryCard
                href={i.permalink}
                title={i.title}
                summary={i.summary}
                date={i.date}
                meta={i.client}
                tags={i.stack.slice(0, 4)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
