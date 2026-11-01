import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

// Required by `output: 'export'` — the image is rendered once at build time.
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Stackrel — we build AI systems that survive production';

export default function Image() {
  return ogImage({
    eyebrow: 'AI engineering agency',
    title: 'We build AI systems that survive production.',
  });
}
