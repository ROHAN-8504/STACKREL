# Stackrel website

- Read `SPEC.md` fully before doing anything. It is the source of truth.
- Static export only (`output: 'export'`): no Server Actions, ISR, middleware
  or request-time rendering.
- Build in the phase order from SPEC.md § Build phases. Stop after each phase
  and report: what was built, what was skipped, budget measurements, open
  questions. Wait for approval before starting the next phase.
- Quote the SPEC.md section you are implementing.
- Never invent client names, metrics or testimonials. Use `TODO:` placeholders.
- Do not copy Vercel's logo, wordmark, illustrations or copy. Design-language
  inspiration only. Geist fonts (SIL OFL) are fine to use.
- Security is a requirement, not a nice-to-have: follow SPEC.md § Security
  requirements exactly.
- Prefer Server Components. Justify every `"use client"` with a comment at the
  top of the file saying why the client is required.
- Before adding a dependency, state its size and why it is needed. Pin exact
  versions, commit the lockfile, and avoid anything published in the last
  14 days.

## Deviations from SPEC.md

Recorded so they are not silently re-introduced. Each was reported at the end
of its phase and approved.

| #   | Spec says                                                   | Built as                                                   | Why                                                                                                                                     |
| --- | ----------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `--fg-subtle` `#6B6B6B` / `#8F8F8F`                         | `#828282` / `#6E6E6E`                                      | Spec values score 3.54:1 and 3.10:1, below the 4.5:1 the same section mandates. Raised to the minimum passing value.                    |
| 2   | no accent foreground token                                  | added `--accent-fg`                                        | The Button spec ("white fill, black text in dark mode") needs a paired foreground.                                                      |
| 3   | status colours "green / amber / red at reduced saturation"  | derived hex per theme                                      | No values given; derived to clear 4.5:1 against the composited badge surface.                                                           |
| 4   | `/styleguide` "dev only"                                    | excluded at build time via `NEXT_PUBLIC_ENABLE_STYLEGUIDE` | A static export has no middleware or request-time gate.                                                                                 |
| 5   | `wrangler.jsonc` with `main`                                | assets-only Worker in Phase 1                              | `worker/index.ts` does not exist until Phase 5.                                                                                         |
| 6   | "latest stable version of each package"                     | TypeScript 6.0.3, not 7.0.2                                | `typescript-eslint` does not support TS 7.0, so lint cannot run on it.                                                                  |
| 7   | `motion` package for animation                              | CSS plus a ~1KB IntersectionObserver                       | Only transform/opacity animate either way; motion would add ~35KB to a first-load budget already over target.                           |
| 8   | `exactOptionalPropertyTypes` (added in Phase 1, not spec'd) | removed                                                    | Not part of `strict`; incompatible with next/link's own prop types.                                                                     |
| 9   | Diagram renders Mermaid at build time                       | Diagram takes an SVG plus caption                          | Mermaid needs a DOM, so build-time rendering means Chromium in CI and on Workers Builds. Deferred pending a decision.                   |
| 10  | MDX rendered in a client component                          | MDX evaluated at build time in a Server Component          | Velite's runtime uses `new Function`, which CSP forbids without `'unsafe-eval'`. Under the production CSP every article rendered empty. |

## Performance budget

SPEC.md asks for first-load JS on `/` under 120KB gzipped. The React 19 +
Next 16 App Router floor is ~129KB gzipped on an essentially empty page, so
that target is unreachable on this stack. Measured as brotli — what
Cloudflare actually serves — the budget is treated as **140KB**, agreed in
Phase 2. Current: `/` ~129KB, `/work/[slug]` ~142KB.

## Security notes

- Worker acceptance tests live in `scripts/contact-worker.test.mjs`; run
  `pnpm test:contact` against a live `wrangler dev`.
- `scripts/build-headers.mjs` generates `out/_headers` after every build,
  hashing inline scripts into the CSP. Never hand-edit `out/_headers`.
- Header values in `worker/security-headers.ts` must stay in step with that
  script: the Worker sends the same headers on its own responses.

## Commands

```
pnpm dev               # next dev
pnpm build             # static export -> out/
pnpm build:styleguide  # build including /styleguide
pnpm start             # wrangler dev, serves out/ as Cloudflare would
pnpm lint
pnpm typecheck
pnpm format
```
