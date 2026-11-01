import Script from 'next/script';

/**
 * Cloudflare Web Analytics — SPEC.md § Analytics.
 *
 * Cookie-less, so no consent banner is required. It collects page views,
 * referrers, countries and Core Web Vitals; it has no custom events, which
 * is why "Start a project" intent is counted in the Worker instead (see
 * worker/index.ts).
 *
 * Renders nothing unless the token is configured, so local and preview
 * builds send no beacons. The token is public by design — it identifies
 * the site, not an account — hence the NEXT_PUBLIC_ prefix.
 */

const TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

export function Analytics() {
  if (!TOKEN) return null;

  return (
    <Script
      id="cf-analytics"
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: TOKEN })}
    />
  );
}
