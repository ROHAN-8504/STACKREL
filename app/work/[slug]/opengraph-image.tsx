import { allWork, workBySlug } from '@/lib/content';
import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

// Required by `output: 'export'` — the image is rendered once at build time.
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Stackrel case study';

export function generateStaticParams() {
  return allWork().map((i) => ({ slug: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = workBySlug(slug);
  return ogImage({
    eyebrow: 'Case study',
    title: entry?.title ?? 'Work',
    meta: entry?.client,
  });
}
