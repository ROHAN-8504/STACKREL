import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate } from '@/lib/content';

/** Shared list-item card for work, writing and lab. */
export function EntryCard({
  href,
  title,
  summary,
  date,
  meta,
  badge,
  tags = [],
  headingLevel = 'h2',
}: {
  href: string;
  title: string;
  summary: string;
  date?: string;
  meta?: string;
  badge?: { label: string; variant: 'default' | 'success' | 'warning' | 'error' };
  tags?: string[];
  /** Pick the level that keeps the page's heading order unbroken. */
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          {badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : null}
          {date ? (
            <time dateTime={date} className="text-small text-fg-subtle">
              {formatDate(date)}
            </time>
          ) : null}
          {meta ? <span className="text-small text-fg-subtle">{meta}</span> : null}
        </div>

        <CardTitle as={headingLevel}>
          {/* Stretched link keeps the whole card clickable with one tab stop. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {title}
          </Link>
        </CardTitle>
        <CardDescription>{summary}</CardDescription>

        {tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t}>
                <Badge>{t}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </CardHeader>
    </Card>
  );
}
