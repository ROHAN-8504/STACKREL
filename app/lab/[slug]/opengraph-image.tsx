import { allLab, labBySlug } from '@/lib/content';
import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

// Required by `output: 'export'` — the image is rendered once at build time.
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Stackrel lab experiment';

export function generateStaticParams() {
  return allLab().map((i) => ({ slug: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = labBySlug(slug);
  return ogImage({
    eyebrow: `Lab · ${entry?.status ?? ''}`.trim(),
    title: entry?.title ?? 'Lab',
  });
}
