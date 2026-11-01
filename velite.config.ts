import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { defineCollection, defineConfig, s } from 'velite';

/**
 * Content collections — SPEC.md § Content model.
 *
 * Three MDX collections validated by Zod at build time. A bad frontmatter
 * field fails the build with a clear error, which is the Phase 4 acceptance
 * check. Publishing is one .mdx file: lists, the command palette index, RSS,
 * the sitemap and OG images all derive from these collections.
 *
 * Drafts build locally but are stripped from production, filtered in
 * lib/content.ts rather than here, so `pnpm dev` still renders them.
 */

// Fields every collection shares.
const shared = {
  title: s.string().max(70, 'title must be 70 characters or fewer'),
  // SPEC.md: "slug: derived from filename if absent". s.path() gives
  // e.g. "work/desistore"; the transform below takes the last segment
  // unless the file declares its own slug.
  path: s.path(),
  slug: s.slug('global').optional(),
  summary: s
    .string()
    .max(160, 'summary must be 160 characters or fewer (it is the meta description)'),
  date: s.isodate(),
  updated: s.isodate().optional(),
  tags: s.array(s.string()).default([]),
  draft: s.boolean().default(false),
  cover: s.image().optional(),
  // Derived, not authored.
  body: s.mdx(),
  toc: s.toc(),
  metadata: s.metadata(), // readingTime + wordCount
};

/** Falls back to the filename stem when a file declares no slug. */
const resolveSlug = (data: { slug?: string | undefined; path: string }): string =>
  data.slug ?? data.path.split('/').pop() ?? data.path;

const work = defineCollection({
  name: 'Work',
  pattern: 'work/**/*.mdx',
  schema: s
    .object({
      ...shared,
      client: s.string().default('Stackrel'),
      role: s.string().optional(),
      stack: s.array(s.string()).default([]),
      metrics: s.array(s.object({ label: s.string(), value: s.string() })).default([]),
      liveUrl: s.string().url().optional(),
      repoUrl: s.string().url().optional(),
      featured: s.boolean().default(false),
      confidential: s.boolean().default(false),
    })
    .transform((data) => {
      const slug = resolveSlug(data);
      return {
        ...data,
        slug,
        permalink: `/work/${slug}`,
        // confidential hides the client name rather than the entry.
        client: data.confidential ? 'Confidential' : data.client,
      };
    }),
});

const writing = defineCollection({
  name: 'Writing',
  pattern: 'writing/**/*.mdx',
  schema: s
    .object({
      ...shared,
      kind: s.enum(['writeup', 'breakdown', 'learning', 'tutorial']),
      series: s.string().optional(),
    })
    .transform((data) => {
      const slug = resolveSlug(data);
      return { ...data, slug, permalink: `/writing/${slug}` };
    }),
});

const lab = defineCollection({
  name: 'Lab',
  pattern: 'lab/**/*.mdx',
  schema: s
    .object({
      ...shared,
      status: s.enum(['running', 'shipped', 'killed']),
      hypothesis: s.string(),
      result: s.string().optional(),
      startedAt: s.isodate(),
      endedAt: s.isodate().optional(),
    })
    .transform((data) => {
      const slug = resolveSlug(data);
      return { ...data, slug, permalink: `/lab/${slug}` };
    }),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:8].[ext]',
    clean: true,
  },
  collections: { work, writing, lab },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          // Shiki themes matched to the design tokens (SPEC.md § Core
          // components — Code block).
          theme: { dark: 'github-dark-dimmed', light: 'github-light' },
          keepBackground: false,
        },
      ],
    ],
  },
});
