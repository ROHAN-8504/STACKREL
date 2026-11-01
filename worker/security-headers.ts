/**
 * The same security headers the static assets get via public/_headers.
 * SPEC.md: "the contact Worker sets the same headers on its responses".
 *
 * Kept in one place and generated into _headers by
 * scripts/build-headers.mjs, so the two can never drift.
 */

export const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/** JSON response carrying the security headers and no cache. */
export function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...SECURITY_HEADERS,
    },
  });
}
