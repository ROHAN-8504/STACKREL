// Generates out/_headers with the full security header set.
//
// SPEC.md § Security requirements: a static export cannot use per-request
// CSP nonces, so this script hashes every inline <script> in the exported
// HTML and writes those SHA-256 hashes into the policy. Run after
// `next build`, before deploy.
//
// Keep the header values here in step with worker/security-headers.ts —
// the Worker must send the same headers on its own responses.

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = 'out';

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** Every inline <script>…</script> body in the export, hashed. */
async function inlineScriptHashes() {
  const hashes = new Set();
  let files = 0;
  for await (const file of walk(OUT)) {
    if (!file.endsWith('.html')) continue;
    files += 1;
    const html = await readFile(file, 'utf8');
    // Inline scripts only: those with a src= attribute are external.
    for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      const body = m[1];
      if (!body) continue;
      hashes.add(createHash('sha256').update(body, 'utf8').digest('base64'));
    }
  }
  return { hashes: [...hashes].sort(), files };
}

const { hashes, files } = await inlineScriptHashes();

// Cloudflare Web Analytics beacon + Turnstile are the only third parties
// the spec permits.
const TURNSTILE = 'https://challenges.cloudflare.com';
const BEACON = 'https://static.cloudflareinsights.com';

const csp = [
  "default-src 'self'",
  ['script-src', "'self'", ...hashes.map((h) => `'sha256-${h}'`), TURNSTILE, BEACON].join(
    ' ',
  ),
  `frame-src ${TURNSTILE}`,
  // Tailwind injects no runtime styles, but next/font and the theme script
  // set inline style attributes, which style-src-attr covers.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // Same-origin only: the form posts to /api/contact on this domain, and
  // the analytics beacon POSTs to its own host.
  `connect-src 'self' ${BEACON}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const header = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cross-Origin-Opener-Policy: same-origin

# next/og writes OG images to extensionless paths, so the asset handler
# cannot infer a type. Social crawlers reject an untyped image.
/opengraph-image
  Content-Type: image/png
  Cache-Control: public, max-age=3600

/*/opengraph-image
  Content-Type: image/png
  Cache-Control: public, max-age=3600

# Hashed build output is immutable.
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/static/*
  Cache-Control: public, max-age=31536000, immutable
`;

await writeFile(join(OUT, '_headers'), header);
console.log(
  `build-headers: ${hashes.length} inline script hash(es) from ${files} HTML file(s)`,
);
