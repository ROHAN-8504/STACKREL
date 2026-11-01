/**
 * Landing page copy.
 *
 * Positioning, per Rohan: Stackrel is an AI agency that ships production
 * work, and the founder stays faceless for now — so the voice is "we" and
 * no person is named anywhere.
 *
 * Copy here is real, written placeholder copy, not lorem. The one thing
 * deliberately left unfilled is client-facing NUMBERS: inventing a latency
 * or an adoption figure would put a false claim on the page. Those carry an
 * explicit `pending` flag and render as an em dash until Rohan supplies them.
 */

export const HERO = {
  label: 'AI engineering agency',
  // SPEC.md § Open decisions — candidate 2, chosen to match "ships production".
  headline: 'We build AI systems that survive production.',
  sub: 'Stackrel designs, ships and maintains AI agents, LLM applications and the backends behind them — evaluated before launch, monitored after it.',
  primary: { label: 'Start a project', href: '/contact' },
  secondary: { label: 'See the work', href: '/work' },
} as const;

export const SERVICES = {
  label: 'What we build',
  heading: 'Three ways we work',
  // Training is held back until there are case studies to stand on
  // (SPEC.md § Open decisions — Services list). Adding it later is one entry.
  items: [
    {
      title: 'AI agents and LLM apps',
      body: 'Retrieval, tool use and multi-step agents, built with evals and guardrails so behaviour is measurable before it reaches a user.',
    },
    {
      title: 'Production backends',
      body: 'The APIs, queues and data layers that keep AI features fast and affordable once real traffic arrives.',
    },
    {
      title: 'AI-native MVPs',
      body: 'From scope to a deployed product, built to be extended rather than rewritten the moment it finds users.',
    },
  ],
} as const;

export type Metric = { label: string; value: string | null };

export const FEATURED = {
  label: 'Featured work',
  heading: 'DesiStore',
  summary:
    'An Indian alternative to FakeStoreAPI: a catalogue API with realistic local products, prices and categories, with AI features layered on top so prototypes can be built against data that looks like the market they target.',
  // TODO (Rohan): live URL, repo URL and real metrics. SPEC.md § First entry.
  liveUrl: null as string | null,
  repoUrl: null as string | null,
  metrics: [
    { label: 'Endpoints', value: null },
    { label: 'p95 response', value: null },
    { label: 'Requests served', value: null },
  ] satisfies Metric[],
  href: '/work',
} as const;

export const PROCESS = {
  label: 'How we work',
  heading: 'Four steps, no surprises',
  steps: [
    {
      n: '01',
      title: 'Scope',
      body: 'We agree what success means and what it is worth, in writing, before any code.',
    },
    {
      n: '02',
      title: 'Build',
      body: 'Short cycles against a working deployment, so progress is something you can click.',
    },
    {
      n: '03',
      title: 'Evaluate',
      body: 'Evals, load tests and cost modelling. Behaviour gets measured, not asserted.',
    },
    {
      n: '04',
      title: 'Ship and maintain',
      body: 'Launch, monitoring and a clear handover — or we keep running it for you.',
    },
  ],
} as const;

export const LATEST = {
  label: 'From the lab and the writing',
  heading: 'What we are learning',
  // Populated automatically from the MDX collections in Phase 4.
  empty:
    'Write-ups, breakdowns and experiment results will appear here as they are published.',
} as const;

export const OPEN_SOURCE = {
  label: 'Open source',
  heading: 'Things we give away',
  // Populated from the GitHub API at build time in Phase 4.
  empty:
    'Repositories and packages will be listed here, pulled from GitHub when the site builds.',
} as const;

export const CTA = {
  heading: 'Have something to build?',
  sub: 'Tell us what you are trying to ship and what is in the way. We reply within two working days.',
  action: { label: 'Start a project', href: '/contact' },
} as const;
