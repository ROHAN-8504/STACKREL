import { jsonLdScript } from '@/lib/seo';

/**
 * Structured data. Server Component.
 *
 * The CSP hashes every inline script in the export, and
 * scripts/build-headers.mjs picks these up automatically, so no
 * 'unsafe-inline' is needed.
 */
export function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  return (
    <>
      {data.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Serialised from our own typed objects, with `<` escaped.
          dangerouslySetInnerHTML={{ __html: jsonLdScript(d) }}
        />
      ))}
    </>
  );
}
