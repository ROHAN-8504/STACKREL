/**
 * Site-wide constants and navigation.
 *
 * Anything Rohan has not supplied is left as an explicit TODO and is not
 * rendered, so no invented handle or address can ship (SPEC.md standing
 * instructions).
 */

export const SITE = {
  name: 'Stackrel',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stackrel.com',
  // SPEC.md § Deploying to Cloudflare, step 6: Email Routing creates this
  // address and forwards it to Rohan's Gmail. Listed as still open under
  // "Open decisions for Rohan" — confirm before launch.
  email: 'hello@stackrel.com',
} as const;

export type NavItem = {
  href: string;
  label: string;
  /** Collections render a nav item only once they have published entries. */
  collection?: 'work' | 'writing' | 'lab';
};

/** SPEC.md § Landing page sections — Header. */
export const NAV: readonly NavItem[] = [
  { href: '/work', label: 'Work', collection: 'work' },
  { href: '/writing', label: 'Writing', collection: 'writing' },
  { href: '/lab', label: 'Lab', collection: 'lab' },
  { href: '/open-source', label: 'Open Source' },
  { href: '/about', label: 'About' },
] as const;

/** Every statically exported route, for the command palette index. */
export const ROUTES: readonly { href: string; label: string; hint: string }[] = [
  { href: '/', label: 'Home', hint: 'What Stackrel is' },
  { href: '/work', label: 'Work', hint: 'Case studies' },
  { href: '/writing', label: 'Writing', hint: 'Write-ups and breakdowns' },
  { href: '/lab', label: 'Lab', hint: 'Experiments' },
  { href: '/open-source', label: 'Open Source', hint: 'Repos and packages' },
  { href: '/about', label: 'About', hint: 'How Stackrel works' },
  { href: '/contact', label: 'Contact', hint: 'Start a project' },
] as const;

/**
 * TODO: Rohan to supply real handles. Entries with an empty url are not
 * rendered, so nothing invented reaches the page.
 */
export const SOCIAL: readonly { label: string; url: string }[] = [
  { label: 'GitHub', url: '' },
  { label: 'X', url: '' },
  { label: 'LinkedIn', url: '' },
] as const;

export const FOOTER_COLUMNS: readonly {
  heading: string;
  links: readonly { href: string; label: string }[];
}[] = [
  {
    heading: 'Work',
    links: [
      { href: '/work', label: 'Case studies' },
      { href: '/open-source', label: 'Open source' },
      { href: '/lab', label: 'Lab' },
    ],
  },
  {
    heading: 'Writing',
    links: [
      { href: '/writing', label: 'All writing' },
      { href: '/rss.xml', label: 'RSS' },
    ],
  },
  {
    heading: 'Stackrel',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Start a project' },
    ],
  },
] as const;
