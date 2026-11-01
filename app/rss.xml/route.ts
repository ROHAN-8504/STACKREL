import { allLab, allWork, allWriting } from '@/lib/content';
import { SITE } from '@/lib/site';

// SPEC.md § SEO: rss.xml generated from content; drafts excluded (the
// lib/content accessors already drop them in production).
//
// `force-static` makes this a build-time file in the static export — there
// is no server at request time.
export const dynamic = 'force-static';

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function GET() {
  const items = [
    ...allWriting().map((i) => ({ ...i, section: 'Writing' })),
    ...allLab().map((i) => ({ ...i, section: 'Lab' })),
    ...allWork().map((i) => ({ ...i, section: 'Work' })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>AI engineering agency. Case studies, write-ups and experiments.</description>
    <language>en</language>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date(items[0]?.date ?? Date.now()).toUTCString()}</lastBuildDate>
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${SITE.url}${i.permalink}</link>
      <guid isPermaLink="true">${SITE.url}${i.permalink}</guid>
      <description>${esc(i.summary)}</description>
      <category>${esc(i.section)}</category>
      <pubDate>${new Date(i.date).toUTCString()}</pubDate>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
