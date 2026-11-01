# Deploying Stackrel

Everything below follows SPEC.md § Deploying to Cloudflare and § Build
phases, Phase 7. The target is **₹0/month**: a static export served by
Cloudflare's asset handler plus one small Worker for `/api/contact`. The
only recurring cost is the domain.

Work through it in order — several steps produce a value a later step
needs.

---

## Before you start

| You need             | Where it comes from   |
| -------------------- | --------------------- |
| A Cloudflare account | free plan is enough   |
| `stackrel.com`       | owned already         |
| The GitHub repo      | `ROHAN-8504/STACKREL` |

If the domain is **not** on Cloudflare yet, add it first: Cloudflare
dashboard → Add a site → `stackrel.com`, then change the nameservers at
your current registrar to the two Cloudflare gives you. DNS propagation
takes anywhere from minutes to a few hours, and nothing below works until
the zone is active. Transferring the registration to Cloudflare Registrar
is optional; only the DNS zone matters.

---

## 1. Create the Worker from the repo

Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a
repository** → pick `ROHAN-8504/STACKREL`.

| Setting        | Value                 |
| -------------- | --------------------- |
| Build command  | `pnpm build`          |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/`                   |

`wrangler.jsonc` already declares the asset directory (`./out`), the entry
point (`worker/index.ts`) and `run_worker_first: ["/api/*"]`, so static
requests are served straight from the edge and never count against the
100k/day Worker request limit.

The first build **will fail** until step 2 — the KV namespace id is still
a placeholder. That is expected.

---

## 2. KV namespace (rate limiting)

```bash
npx wrangler kv namespace create RATE_LIMIT
```

It prints an id. Put it in `wrangler.jsonc`, replacing
`TODO_KV_NAMESPACE_ID`:

```jsonc
"kv_namespaces": [{ "binding": "RATE_LIMIT", "id": "<the id>" }]
```

A namespace id is not a secret; committing it is fine. Commit and push —
that triggers a rebuild.

This namespace holds two things, neither of them personal data: a
per-IP submission counter with a one-hour TTL, and a per-day count of
successful submissions.

---

## 3. Custom domains

Worker → **Settings** → **Domains & Routes** → add both:

- `stackrel.com`
- `www.stackrel.com`

Because the zone is already on Cloudflare, DNS records and TLS
certificates are created automatically.

Then **Rules** → **Redirect Rules** → create a 301 from
`www.stackrel.com/*` to `https://stackrel.com/$1`.

Finally **SSL/TLS** → turn on **Always Use HTTPS** and enable **HSTS**.
The site already sends `Strict-Transport-Security` with a two-year
max-age and `preload`.

---

## 4. Email Routing

**Email** → **Email Routing** → enable it for the zone.

1. Create the address `hello@stackrel.com`, forwarding to your Gmail.
2. Open the verification mail Cloudflare sends to that Gmail and confirm
   it. **The contact form cannot deliver until this is verified** — the
   `send_email` binding only sends to verified destinations.

`wrangler.jsonc` already binds `CONTACT_EMAIL` to
`hello@stackrel.com`. Change `vars.CONTACT_TO` and `vars.CONTACT_FROM`
there if you use a different address.

---

## 5. Turnstile

**Turnstile** → create a widget for `stackrel.com`. You get two keys.

The **site key** is public and goes in the build environment:

Worker → Settings → **Variables and Secrets** → add a plaintext variable
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

The **secret key** is a secret:

```bash
npx wrangler secret put TURNSTILE_SECRET
```

Until the site key is set, the contact form renders a visible `TODO`
where the widget belongs, and every submission is refused — verification
fails closed by design.

---

## 6. Web Analytics

**Analytics & Logs** → **Web Analytics** → add `stackrel.com`. Copy the
site token into a build variable `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`.

It is cookie-less, so no consent banner is required. The beacon host is
already allowed in the Content-Security-Policy. With no token set, no
beacon is loaded at all.

---

## 7. Daily rebuild

Worker → Settings → **Builds** → create a **Deploy hook**. Copy the URL.

In GitHub: repo → Settings → Secrets and variables → Actions → new
repository secret named `CLOUDFLARE_DEPLOY_HOOK`, pasting that URL.

`.github/workflows/daily-rebuild.yml` posts to it at 04:17 UTC daily, so
`/open-source` picks up fresh GitHub data. Without the secret the
workflow skips cleanly instead of failing.

### GitHub token for the open-source page (optional)

`/open-source` reads public repos for `GITHUB_OWNER` (defaults to
`ROHAN-8504`). Unauthenticated requests are rate limited to 60/hour per
IP, which is fine for a daily build. If you hit the limit, add a
**fine-grained, read-only, public-repositories-only** token as the build
variable `GITHUB_READ_TOKEN`. Never give it write scopes.

---

## 8. Accounts

- Two-factor authentication on both Cloudflare and GitHub.
- Keep the domain's transfer lock on.

---

## Verifying the deployment

Phase 7 is done when all of these pass.

```bash
# 1. The site is live and redirects correctly
curl -sI https://www.stackrel.com | grep -i location    # -> https://stackrel.com/
curl -so /dev/null -w '%{http_code}\n' https://stackrel.com/

# 2. Security headers are present
curl -sI https://stackrel.com | grep -iE 'content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy|cross-origin-opener'

# 3. OG images serve as PNG, not as an untyped blob
curl -sI https://stackrel.com/opengraph-image | grep -i content-type   # -> image/png

# 4. Feeds exist
curl -so /dev/null -w '%{http_code}\n' https://stackrel.com/rss.xml
curl -so /dev/null -w '%{http_code}\n' https://stackrel.com/sitemap.xml

# 5. The dev-only styleguide is NOT published
curl -so /dev/null -w '%{http_code}\n' https://stackrel.com/styleguide/   # -> 404

# 6. The contact endpoint rejects a foreign Origin
curl -s -X POST https://stackrel.com/api/contact \
  -H 'origin: https://evil.test' -H 'content-type: application/json' \
  -d '{}' -w '\n%{http_code}\n'                                          # -> 403
```

Then the full Worker suite against production:

```bash
WORKER_URL=https://stackrel.com ALLOWED_ORIGIN=https://stackrel.com \
  node --test --experimental-strip-types scripts/contact-worker.test.mjs
```

Note this writes real rate-limit counters for the test IPs and, if
Turnstile passes, can deliver real mail. Run it once, deliberately.

Finally, the two checks only a human can make:

- **Submit the form on the live site** and confirm the message arrives in
  your Gmail, with the visitor's address in `Reply-To`.
- **Paste a link into Slack, WhatsApp or X** and confirm the OG preview
  renders.

Also worth running once live: [securityheaders.com](https://securityheaders.com)
(target A+) and PageSpeed Insights.

---

## Rollback

Worker → **Deployments** → pick a previous deployment → **Rollback**.
Static assets and Worker code roll back together, so the site returns to
a known-good state in one action.
