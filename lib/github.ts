import { SITE } from '@/lib/site';

/**
 * Repository data fetched from GitHub at build time.
 *
 * SPEC.md § Rendering rules: "GitHub repo data is fetched at build time; a
 * daily GitHub Actions cron triggers a rebuild to keep it fresh."
 *
 * Security (SPEC.md § Secrets and config): the token is optional and must
 * be a fine-grained, read-only token for public repos. It is read from a
 * server-only variable — never NEXT_PUBLIC_ — and is only ever used here,
 * at build time, so it cannot reach the client bundle.
 *
 * Every field rendered from this data is treated as text, never HTML
 * (SPEC.md § Content and output safety).
 */

export type Repo = {
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  updatedAt: string;
};

/** Set to a GitHub user or org to populate /open-source. */
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? '';

type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

export async function fetchRepos(): Promise<{ repos: Repo[]; note: string | null }> {
  if (!GITHUB_OWNER) {
    return {
      repos: [],
      note: 'Set GITHUB_OWNER at build time to list repositories here.',
    };
  }

  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': `${SITE.name}-site`,
    'x-github-api-version': '2022-11-28',
  };
  const token = process.env.GITHUB_READ_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_OWNER)}/repos?per_page=100&sort=pushed`,
      { headers },
    );
    if (!res.ok) {
      return {
        repos: [],
        note: `GitHub returned ${res.status}. Repository list is empty for this build.`,
      };
    }
    const json = (await res.json()) as GitHubRepo[];
    const repos = json
      .filter((r) => !r.fork && !r.archived && !r.private)
      .map<Repo>((r) => ({
        name: r.name,
        description: r.description ?? '',
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        updatedAt: r.pushed_at,
      }))
      .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
    return { repos, note: null };
  } catch (error) {
    // A build must not fail because GitHub is unreachable: the daily cron
    // rebuild will pick the data up. The page explains the gap instead.
    const reason = error instanceof Error ? error.message : 'unknown error';
    console.warn(
      `[open-source] GitHub fetch failed (${reason}); building with an empty list.`,
    );
    return { repos: [], note: 'Repository data could not be fetched for this build.' };
  }
}
