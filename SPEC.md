# Stackrel Website — Build Spec

2026-11-01 · @Rohan

## Purpose and goals

Stackrel.com is a fast, monochrome, Vercel-feel site that proves Stackrel ships production AI work and publishes what it learns. v1 is a landing page plus case studies, writing, lab experiments and open source, built so new content is a single MDX file.

**Audiences, in priority order**
1. Prospective agency clients: "Can these people ship production AI for us?" They need proof: case studies, live demos, numbers.
2. Developers and learners (the future edtech community): "Is this worth following?" They need write-ups, breakdowns and open source.
3. Recruiters and background checks: "Is Stackrel real?" They need a coherent, professional presence.

**Goals for v1**
- Explain what Stackrel is in under 5 seconds above the fold.
- Show DesiStore as the first case study, with a live link and its technical breakdown.
- Make publishing a write-up, experiment or project a matter of adding one MDX file and pushing.
- Feel instant: static pages, no layout shift, subtle motion, keyboard-first navigation.
- Leave a slot for a newsletter without building it yet.

**Non-goals for v1:** no CMS, no auth, no user accounts, no blog comments, no newsletter backend, no course platform.

**How to use this spec with Claude Code**
- Save this doc as `SPEC.md` in the repo root. Put a short `CLAUDE.md` that says: read SPEC.md first, follow the build phases in order, stop for review after each phase.
- Design first, code second: ask Claude Code to produce the design tokens and a static landing-page mockup in Phase 1, review it, then continue.
- The design is *inspired by* Vercel's design language. Do not copy Vercel's logo, triangle mark, wordmark, illustrations or page copy. Geist fonts are open source (SIL OFL) and fine to use.

## Information architecture

Nine routes for v1, all statically generated. The landing page is the priority; every other page is a list view or an MDX detail view.

| Route | Purpose | Key content |
| --- | --- | --- |
| `/` | Landing: what Stackrel is, proof, contact | Hero, services, featured work, latest writing, lab, open source, CTA |
| `/work` | Case studies index | Card grid: client/project, problem, stack, outcome metric |
| `/work/[slug]` | One case study | Problem, constraints, architecture, decisions, results, links |
| `/writing` | Write-ups, breakdowns, learnings | List with date, tags, reading time; tag filter |
| `/writing/[slug]` | One article | MDX with code blocks, callouts, diagrams, table of contents |
| `/lab` | Experiments run on Stackrel | Status-tagged list: running, shipped, killed, with results |
| `/open-source` | Repos and packages | Cards from GitHub data at build time: stars, language, description |
| `/about` | What Stackrel is and how it works | Story, principles, how engagements run |
| `/contact` | Start a project | Form or booking link; what to include; response time |

Also generate: `/rss.xml`, `/sitemap.xml`, `/robots.txt`, dynamic OG images per page, a custom `404` and `/newsletter` held behind a feature flag (off in v1).

**Landing page sections, top to bottom**
1. **Header:** wordmark left; Work, Writing, Lab, Open Source, About in the centre; ⌘K hint and "Start a project" button right. Sticky, transparent at top, blurred background plus a hairline border after scrolling 8px.
2. **Hero:** one-line positioning, one sub-line, two buttons (primary: "Start a project"; secondary: "See the work"). Grid-line background with a faint radial glow.
3. **What we build:** 3–4 service cards (e.g. AI agents and LLM apps, production backends, AI-native MVPs, team training).
4. **Featured work:** DesiStore as a large card with a screenshot, a short problem statement and 2–3 numbers.
5. **How we work:** a 4-step horizontal process (scope, build, evaluate, ship and maintain).
6. **From the lab and the writing:** latest 3 items, pulled from MDX automatically.
7. **Open source:** a strip of repo cards.
8. **CTA band:** "Have something to build?" plus the button.
9. **Footer:** columns of links, social links, email, © Stackrel, and a theme toggle.

**Command palette (⌘K / Ctrl+K):** search pages, case studies, articles and experiments; quick actions like "Copy email", "Toggle theme" and "Start a project". This one feature carries much of the Vercel feel.

## Tech stack and architecture

Next.js App Router built as a **static export** (`output: 'export'`), served as static assets from Cloudflare's edge for ₹0/month. The only server code is a small contact Worker on the same domain. No database, no paid service; the only recurring cost is the domain renewal.

| Layer | Choice | Why | Cost |
| --- | --- | --- | --- |
| Framework | Next.js (App Router), TypeScript strict, `output: 'export'` | Static HTML/CSS/JS; client-side navigation and prefetch still work | Free |
| Styling | Tailwind CSS with CSS-variable design tokens | Tokens in one place; dark/light by swapping variables | Free |
| Components | shadcn/ui on Radix primitives | Accessible menus, dialogs and tabs you own as source | Free |
| Fonts | `geist` package via `next/font` | Self-hosted, no layout shift | Free |
| Motion | `motion` + CSS transitions | Layout animations, reveals, springs | Free |
| Command palette | `cmdk` | The ⌘K palette | Free |
| Theme | `next-themes` | Dark default, no flash on load | Free |
| Content | MDX + Velite (Zod-validated frontmatter) | Type-safe collections; build fails on bad frontmatter | Free |
| Code blocks | Shiki via `rehype-pretty-code` | Build-time highlighting, zero client JS | Free |
| Images | Pre-optimised to AVIF/WebP at build time (`sharp` script) | Static export has no runtime image optimiser | Free |
| OG images | Generated at build time (Satori/`@vercel/og` in a build script) | No per-request server needed | Free |
| Hosting | Cloudflare Workers static assets | Unlimited free static requests, edge-served worldwide | Free |
| Contact backend | One small Cloudflare Worker at `/api/contact` | A few KB, far under the free 3 MiB / 10ms limits | Free (100k req/day) |
| Email delivery | Cloudflare Email Routing + Worker `send_email` binding | Sends form submissions to your own verified inbox; no email provider | Free |
| Domain inbox | Email Routing: `hello@stackrel.com` → your Gmail | Professional address, receive-only | Free |
| Bot protection | Cloudflare Turnstile + honeypot | Invisible CAPTCHA alternative | Free |
| Rate limiting | Workers KV counter per IP | Free tier allows 1,000 writes/day, enough for any real form traffic | Free |
| Analytics | Cloudflare Web Analytics | Cookie-less, no consent banner | Free |
| CI / scheduled rebuild | GitHub Actions | Lint, typecheck, build; daily cron rebuild for GitHub repo data | Free |
| Domain | stackrel.com on Cloudflare Registrar | At-cost renewal | ~$10–11/yr |

**Rendering rules**
- Every page is pre-rendered at build time. No Server Components at request time, no Server Actions, no ISR, no middleware: none of these exist in a static export, so Claude Code must not use them.
- GitHub repo data is fetched at build time; a daily GitHub Actions cron triggers a rebuild to keep it fresh.
- Client components only where interaction needs them: header scroll state, command palette, theme toggle, tabs, contact form.
- The contact form posts to `/api/contact` on the same origin, so no CORS and the CSP can stay `connect-src 'self'`.
- Use the latest stable version of each package at build time and commit the lockfile. Avoid packages published in the last 14 days.

**Hosting decision:****Cloudflare Workers, free plan, at https://stackrel.com.** The free plan allows commercial use and serves static asset requests free and unlimited. A full Next.js server build often exceeds the free plan's 3 MiB Worker size limit, which is why this site is a static export plus one tiny Worker ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [pricing](https://developers.cloudflare.com/workers/platform/pricing/), [OpenNext size note](https://opennext.js.org/cloudflare)). If the site later needs real server features (logins, dashboards), move to Workers Paid ($5/month, 10 MiB).

**Deploying to Cloudflare and connecting stackrel.com** (domain, DNS and hosting all in one Cloudflare account)
1. One Worker project with a `wrangler.jsonc`: `assets.directory = "./out"` (the static export), `main = "worker/index.ts"`, and assets served first so only `/api/*` runs Worker code. Static requests then never count against the 100k/day limit.
2. Push the repo to GitHub. In Cloudflare → Workers & Pages → Create → Import a repository (Workers Builds). Build command `pnpm build`; deploy with `wrangler deploy`. Each branch gets a preview URL.
3. Worker → Settings → Domains & Routes → add `stackrel.com` and `www.stackrel.com` as custom domains. Because the zone is already on Cloudflare, DNS records and HTTPS certificates are created automatically.
4. Rules → Redirect Rules: permanent (301) redirect from `www.stackrel.com/*` to `https://stackrel.com/$1`.
5. SSL/TLS: enable Always Use HTTPS and HSTS.
6. Email → Email Routing: enable it, create `hello@stackrel.com` forwarding to your Gmail, and verify the Gmail address. That verified address is where the contact Worker delivers submissions.
7. Turnstile: create a free widget for stackrel.com. The site key goes in the frontend; the secret goes into the Worker with `wrangler secret put TURNSTILE_SECRET`.
8. Create a KV namespace for rate limiting and bind it to the Worker.
9. Web Analytics: enable it for stackrel.com (cookie-less).
10. GitHub Actions: a daily cron that triggers a rebuild (deploy hook or `wrangler deploy`) to refresh the open-source page.
11. Two-factor login on Cloudflare and GitHub; keep the domain's transfer lock on.

**Repo layout**

```
app/            routes and layouts (all statically exported)
components/ui/  shadcn primitives (button, dialog, tabs…)
components/     site components (header, hero, cards, cmdk)
content/        work/ writing/ lab/  (MDX files)
lib/            tokens, motion presets, github fetcher
scripts/        build-time OG images, image optimisation
worker/         contact Worker (index.ts, validation, email)
public/         images, favicon, _headers
wrangler.jsonc  Worker + static assets config
```

## Design system

The Vercel feel comes from restraint: near-black and white, 1px hairline borders, one typeface family, tight large headings, lots of space, and colour used only to signal. Build every surface from the tokens below; no ad-hoc hex values in components.

**Principles**
- Monochrome first. Colour appears only for status (success, warning, error) and one restrained hero gradient.
- Borders, not shadows, define structure. Shadows are reserved for floating layers (menus, dialogs, command palette).
- Grid lines and dot patterns as quiet background texture, masked to fade at the edges.
- Content width 1200px max; text column 680px for articles.
- Every interactive element has a visible hover, active and focus state.

**Colour tokens (dark default / light)**

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--bg` | #0A0A0A | #FFFFFF | Page background |
| `--bg-subtle` | #111111 | #FAFAFA | Cards, code blocks |
| `--bg-hover` | #1A1A1A | #F2F2F2 | Hovered cards and rows |
| `--border` | rgba(255,255,255,0.10) | rgba(0,0,0,0.08) | Hairlines |
| `--border-strong` | rgba(255,255,255,0.18) | rgba(0,0,0,0.15) | Hovered borders, inputs |
| `--fg` | #EDEDED | #171717 | Primary text |
| `--fg-muted` | #A1A1A1 | #666666 | Secondary text |
| `--fg-subtle` | #6B6B6B | #8F8F8F | Captions, metadata |
| `--accent` | #FFFFFF | #000000 | Primary button fill |
| `--success` / `--warning` / `--error` | green / amber / red at reduced saturation | same | Status only |

All text pairs must pass WCAG AA contrast (4.5:1 body, 3:1 large text).

**Typography (Geist Sans; Geist Mono for code, labels, numbers)**

| Role | Size / line height | Weight | Tracking |
| --- | --- | --- | --- |
| Display (hero) | clamp(40px, 6vw, 72px) / 1.05 | 600 | -0.04em |
| H1 | 40px / 1.1 | 600 | -0.03em |
| H2 | 28px / 1.2 | 600 | -0.02em |
| H3 | 20px / 1.3 | 600 | -0.01em |
| Body | 16px / 1.6 | 400 | 0 |
| Small | 14px / 1.5 | 400 | 0 |
| Label (mono, uppercase) | 12px / 1.4 | 500 | +0.04em |

**Spacing, radius, layers**
- Spacing scale 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Sections separated by 96–128px.
- Radius: 6px (buttons, inputs), 12px (cards), 16px (dialogs), full (badges).
- Z layers: header 40, popovers 50, dialog and palette 60, toast 70.

**Core components**
- **Button:** primary (white fill, black text in dark mode), secondary (transparent, hairline border), ghost. Height 36px default, 40px large. Optional trailing arrow that shifts 2px on hover.
- **Card:** `--bg-subtle`, 1px border, 12px radius. Hover: border goes to `--border-strong` and background to `--bg-hover` in 150ms. Optional spotlight effect (radial gradient following the cursor) on featured cards only.
- **Badge:** mono label, pill, hairline border; status variants use the status colours at 15% opacity fill.
- **Tabs:** text tabs with an underline indicator that slides between tabs (shared layout animation).
- **Kbd:** small mono chip for shortcuts (⌘K).
- **Code block:** Shiki theme matched to tokens, filename header, copy button with a check-mark confirmation.
- **Callout:** note, warning and tip variants for articles.
- **Section label:** small mono uppercase label above each landing section heading.

**Brand assets to create (do not borrow Vercel's)**
- A Stackrel wordmark set in Geist, plus a simple original mark (for example, stacked layers) as SVG.
- Favicon, Apple touch icon, and an OG image template: black background, wordmark, page title in Display style, grid texture.

## Motion and UX smoothness

Smoothness is mostly perceived speed, not animation. Pages must load instantly, never shift, and respond to input within one frame; motion is short, subtle and only on transform and opacity. If an animation is noticeable as an animation, it is too long.

**Timing and easing tokens**

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 100ms | Hover colour and border changes, button press |
| `--dur-fast` | 150ms | Dropdowns, tooltips, toggles |
| `--dur-base` | 250ms | Dialog and palette open, tab indicator |
| `--dur-slow` | 500ms | Scroll reveals, hero entrance |
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Things entering |
| `--ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | Things moving between positions |
| `--ease-in` | cubic-bezier(0.7, 0, 0.84, 0) | Things leaving (exit at about 70% of enter duration) |
| Spring (motion) | stiffness 400, damping 30 | Tab indicator, layout shifts |

**Motion rules**
1. Animate only `transform` and `opacity`. Never width, height, top or left.
2. Hover feedback starts within 100ms. No delay on hover-in; a short delay (about 100ms) on hover-out for menus avoids flicker.
3. Scroll reveals: fade from 0 to 1 and rise 8–12px, once per element, triggered at 15% visibility, staggered 50ms between siblings, at most 6 staggered items.
4. Hero entrance on first load only: headline, sub-line and buttons stagger in over 500ms total. Not replayed on client navigation.
5. Page navigation: cross-fade via the View Transitions API (150–200ms), falling back to an instant swap where unsupported.
6. Press feedback: buttons scale to 0.98 on active.
7. Dialog and command palette: scale from 0.96 plus fade in 250ms; backdrop fades in at the same time; closes in 150ms.
8. No scroll-jacking or smooth-scroll libraries. Native scrolling only; anchors use `scroll-behavior: smooth` only when reduced motion is off.
9. `prefers-reduced-motion: reduce` disables reveals, transitions between pages and parallax; colour changes stay.
10. No looping animations except a very slow (20s+) hero gradient drift, paused when off-screen.

**Perceived-speed requirements**
- Links prefetch on hover or viewport (Next.js default); navigation between static pages must feel instant.
- Fonts via `next/font` with `display: swap` and size-adjusted fallbacks: zero layout shift from fonts.
- Every image has width and height (or aspect-ratio) set; images pre-optimised to AVIF/WebP at build time (static export has no runtime optimiser), served with blur placeholders.
- Header state changes use a CSS class toggled by an IntersectionObserver sentinel, not a scroll listener.
- Copy buttons, the theme toggle and form submits give feedback within 100ms (optimistic state, then confirm).
- The command palette opens in under 50ms of the keypress: preload its index on idle.

**Performance budgets (fail the phase if missed, measured on throttled mobile)**

| Metric | Target |
| --- | --- |
| Largest Contentful Paint | < 1.5s |
| Cumulative Layout Shift | < 0.05 |
| Interaction to Next Paint | < 100ms |
| First-load JS on `/` | < 120KB gzipped |
| Lighthouse (all four categories) | ≥ 95 |

**Keyboard-first UX**
- ⌘K / Ctrl+K opens the palette; `/` focuses search on list pages; Esc closes any layer.
- Visible focus ring on every focusable element (2px, offset 2px, `--fg` at 60%).
- A skip-to-content link as the first focusable element.

## Content model

Three MDX collections in `content/`, validated by Zod schemas at build time. Publishing means adding one `.mdx` file and pushing; lists, the command palette index, RSS, the sitemap and OG images update automatically.

**Shared frontmatter (all collections)**

```yaml
title: string            # required, ≤ 70 chars
slug: string             # derived from filename if absent
summary: string          # required, ≤ 160 chars (meta description)
date: YYYY-MM-DD         # required
updated: YYYY-MM-DD      # optional
tags: [string]           # e.g. [agents, rag, backend]
draft: boolean           # drafts build locally, never in production
cover: string            # optional image path
```

**Collection-specific fields**

| Collection | Extra fields |
| --- | --- |
| `work` | `client` (or "Stackrel" for own products), `role`, `stack: [string]`, `metrics: [{label, value}]`, `liveUrl`, `repoUrl`, `featured: boolean`, `confidential: boolean` (hides client name) |
| `writing` | `kind: writeup \| breakdown \| learning \| tutorial`, `readingTime` (computed), `series` (optional) |
| `lab` | `status: running \| shipped \| killed`, `hypothesis`, `result`, `startedAt`, `endedAt` |

**MDX components available inside content:** Callout, CodeBlock (with filename), Figure (image + caption), Tabs, Steps, Metric (big number + label), Diagram (Mermaid rendered at build time), and LinkCard.

**Case-study template (every****`/work`****entry follows it)**
1. The problem, in one paragraph, with who had it.
2. Constraints: budget, time, data, compliance.
3. Architecture: a diagram plus the key components.
4. Decisions and trade-offs: what was chosen, what was rejected and why.
5. Security and reliability: evals, guardrails, failure handling.
6. Results: numbers first (latency, cost, accuracy, adoption).
7. What we'd do differently.

**First entry: DesiStore**
- An Indian alternative to FakeStoreAPI with AI features, already shipped.
- Show: live API link, a small interactive request playground (endpoint picker, response viewer), the architecture diagram, and numbers (endpoints, response time, requests served if tracked).
- Rohan to supply: live URL, repo URL, architecture notes, real metrics. Placeholder copy must be clearly marked `TODO` so nothing invented ships.

**Writing and lab seeds for launch:** at least one write-up (for example "How we built DesiStore") and one lab entry, so those pages aren't empty on day one. Hide a nav item if its collection has zero published entries.

## Security requirements

A mostly static site has a small attack surface. The real risks are the contact form (spam, abuse, email injection), third-party scripts, leaked secrets and the dependency supply chain. Each item below is a phase-5 acceptance check.

**HTTP security headers (set in****public/_headers, which Cloudflare applies to static assets; the contact Worker sets the same headers on its responses****)**

| Header | Value |
| --- | --- |
| Content-Security-Policy | `default-src 'self'`; scripts by **SHA-256 hash** (a static export can't use per-request nonces; a build script computes hashes of inline scripts and writes them into `_headers`); allow `challenges.cloudflare.com` (Turnstile) and the Cloudflare Web Analytics beacon only; `connect-src 'self'`; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'` |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | camera, microphone, geolocation and payment all disabled |
| Cross-Origin-Opener-Policy | `same-origin` |

Target: A+ on securityheaders.com and no CSP violations in the console.

**Contact form**
- The form posts JSON to `POST /api/contact` (the Worker). It accepts only `POST` with `Content-Type: application/json`, a body under 10 KB, and an `Origin` header equal to `https://stackrel.com`.
- Validate every field with Zod in the Worker: length caps (name ≤ 100, message ≤ 5,000), email format, enum for budget and project type. Reject unknown fields.
- Verify the Turnstile token server-side against Cloudflare's siteverify endpoint; also check a hidden honeypot field and a minimum time-to-submit (about 3 seconds).
- Rate limit by IP (`CF-Connecting-IP`): 5 submissions per hour using a KV counter with a 1-hour TTL. Return a generic error, never stack traces.
- Deliver through the `send_email` binding to the verified `hello@stackrel.com` destination only. Build the message with a MIME library, from a fixed sender, plain text body; put the visitor's address only in `Reply-To` after validation and after stripping CR/LF from every header value.
- Secrets (Turnstile secret) via `wrangler secret`, never in the repo or the frontend bundle.
- Don't store submissions in v1.

**Secrets and config**
- All secrets server-only (no `NEXT_PUBLIC_` prefix). Validate env vars at startup with Zod and fail the build if any are missing.
- `.env*` in `.gitignore`; commit a `.env.example` with placeholder names only.
- Use a fine-grained, read-only GitHub token (public repos) for the open-source page, or no token at all.

**Content and output safety**
- MDX is compiled only from files in the repo; never render MDX or HTML from external input.
- Data from the GitHub API is rendered as text, never as HTML.
- External links get `rel="noopener noreferrer"`.

**Supply chain**
- Lockfile committed, exact versions; `npm audit` (or `pnpm audit`) in CI with high and critical issues failing the build.
- Dependabot or Renovate for updates, grouped weekly.
- No third-party script tags beyond analytics and Turnstile.

## SEO, accessibility, analytics

Every page ships with complete metadata, passes WCAG 2.2 AA, and is measured with cookie-less analytics so no consent banner is needed.

**SEO**
- Next.js Metadata API on every route: title template `%s — Stackrel`, description from `summary`, canonical URL.
- OG and Twitter images generated per page at build time via `next/og`, using the OG template from the design system.
- JSON-LD: `Organization` on the home page, `Article` on writing, `CreativeWork` on case studies, `BreadcrumbList` on detail pages.
- `sitemap.xml` and `rss.xml` generated from content; drafts excluded.
- Semantic headings: one H1 per page, no skipped levels.

**Accessibility**
- Semantic landmarks (header, nav, main, footer), skip link, visible focus states.
- Every Radix component keeps its built-in ARIA and keyboard handling; don't override them.
- Colour contrast AA in both themes; never use colour as the only signal (status badges also carry text).
- Images have alt text; decorative textures are `aria-hidden`.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` (dark is the default when the system has no preference).
- Test with keyboard only and with axe DevTools: zero serious or critical issues.

**Analytics**
- Cloudflare Web Analytics (free, cookie-less), its beacon allowed in the CSP.
- It covers page views, referrers, countries and Core Web Vitals. It has no custom events, so track "Start a project" intent by counting `/contact` visits and contact Worker successes (log a counter in KV).
- No personal data in logs or counters.

## Build phases for Claude Code

Seven phases, each ending in a review stop. Claude Code must not start the next phase until Rohan approves the current one; acceptance criteria are the pass/fail checks.
1. **Scaffold and tokens.** Next.js with `output: 'export'` + TypeScript strict + Tailwind + shadcn/ui + Geist + next-themes; design and motion tokens as CSS variables; ESLint, Prettier; `wrangler.jsonc` with the static assets config.
- Accept: `pnpm build` produces `out/`; `wrangler dev` serves it locally; a `/styleguide` page (dev only) shows every colour, type style, button, card, badge, tab and kbd in both themes.
2. **Layout shell.** Header with scroll state, footer, theme toggle, skip link, 404, View Transitions between routes, command palette with static pages.
- Accept: keyboard-only navigation works everywhere; ⌘K opens in under 50ms; zero CLS on navigation.
3. **Landing page.** All nine sections with placeholder copy marked `TODO`, grid background, hero entrance, scroll reveals, featured-card spotlight.
- Accept: Lighthouse ≥ 95 on mobile; reduced-motion mode disables reveals; review the visual feel before continuing.
4. **Content system.** Velite collections and schemas, MDX components, `/work`, `/writing`, `/lab` list and detail pages, reading time, table of contents, tag filter, RSS, sitemap, palette index from content, DesiStore case study, `/open-source` from GitHub at build time, build-time image optimisation and OG images.
- Accept: a bad frontmatter field fails the build with a clear error; adding one MDX file updates every list, the palette, RSS, the sitemap and its OG image.
5. **Contact Worker and security.** `worker/index.ts` for `/api/contact`: Zod validation, Turnstile, honeypot, KV rate limit, `send_email` delivery; `_headers` with CSP hashes generated at build time.
- Accept: every check in the Security section passes; securityheaders.com A+; scripted tests confirm the rate limit, Origin check, size cap, and that CR/LF in input cannot alter email headers.
6. **SEO, analytics, polish.** Metadata, JSON-LD, Web Analytics beacon, final motion tuning.
- Accept: all performance budgets met; axe shows zero serious issues; OG previews render correctly when links are shared.
7. **Deploy on Cloudflare.** Follow the deployment steps in the Tech stack section: Workers Builds from GitHub, custom domains, www redirect rule, Email Routing, Turnstile, KV, Web Analytics, daily rebuild cron, GitHub Actions CI (lint, typecheck, build, audit).
- Accept: https://stackrel.com live; a test submission arrives in the Gmail inbox; total monthly hosting cost ₹0; CI blocks merges on failure.

**Standing instructions for Claude Code**
- Read SPEC.md before every phase; quote the section you are implementing.
- Never invent client names, metrics or testimonials. Use `TODO:` placeholders.
- Prefer Server Components; justify every `"use client"`.
- Before adding a dependency, state its size and why it's needed.
- After each phase, report: what was built, what was skipped, budget measurements, and open questions.

## Open decisions for Rohan

Settle the first three before Phase 3; the rest can wait until Phase 6.

**Positioning line for the hero.** Candidates: "Production-grade AI engineering, built in public." / "We build AI systems that survive production." / "AI agents, backends and MVPs — shipped, measured, maintained."

**Faceless or founder-visible?** A fully faceless site matches the brand plan, but agency trust rises with a named person. Middle option: "Built by Rohan Kumar" on About and in case studies, not in the hero.

**Services list.** Confirm the 3–4 service cards and whether training appears on the site now or after the agency has its first case studies.

**Contact method.** Form only, booking link only (Cal.com), or both.

**Hosting.** Decided: Cloudflare Workers free plan (static export plus a contact Worker), ₹0/month; domain, DNS, email routing and hosting all on Cloudflare.

**Accent.** Pure monochrome, or one signature colour for the hero gradient and links.

**Email.** A domain address such as hello@stackrel.com (needs an email provider) instead of a personal Gmail.

**Newsletter.** Leave the feature-flagged slot off until you choose a provider and a cadence.

**DesiStore assets.** Live URL, repo URL, architecture notes and real metrics.
