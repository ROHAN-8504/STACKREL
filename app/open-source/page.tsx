import { PageHeader } from '@/components/site/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchRepos } from '@/lib/github';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Open Source',
  description: 'Repositories and packages published by Stackrel.',
  path: '/open-source',
});

// Fetched at build time. In a static export this runs once during the
// build; a daily GitHub Actions cron rebuilds to refresh it.
export const dynamic = 'force-static';

export default async function OpenSourcePage() {
  const { repos, note } = await fetchRepos();

  return (
    <div className="container-content pb-24">
      <PageHeader
        label="Open Source"
        title="Things we give away"
        intro="Repositories and packages, pulled from GitHub when the site builds."
      />

      {repos.length === 0 ? (
        <p className="text-body text-fg-muted max-w-prose">
          {note ?? 'No public repositories yet.'}
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <li key={repo.url} className="relative">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle as="h2">
                    {/* Rendered as text, never HTML. */}
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="after:absolute after:inset-0"
                    >
                      {repo.name}
                    </a>
                  </CardTitle>
                  {repo.description ? (
                    <CardDescription>{repo.description}</CardDescription>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {repo.language ? <Badge>{repo.language}</Badge> : null}
                    <span className="text-small text-fg-subtle">
                      {repo.stars} {repo.stars === 1 ? 'star' : 'stars'}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
