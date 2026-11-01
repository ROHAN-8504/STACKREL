import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Resolve the Velite output (`#site/content`) for the bundler as well as
  // for TypeScript. Velite writes .velite/ before `next build` runs.
  turbopack: {
    resolveAlias: { '#site/content': './.velite' },
  },
  // Static export: no server at request time. Phase 1 of SPEC.md.
  output: 'export',

  // Static export has no runtime image optimiser; images are pre-optimised
  // to AVIF/WebP by a build script in Phase 4.
  images: { unoptimized: true },

  // Emit `out/foo/index.html` so Cloudflare's static asset handler serves
  // clean URLs without a trailing-slash redirect.
  trailingSlash: true,

  typescript: { ignoreBuildErrors: false },

  // Opt out of the `x-powered-by` fingerprint.
  poweredByHeader: false,
};

export default nextConfig;
