import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
