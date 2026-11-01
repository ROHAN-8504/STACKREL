import Link from 'next/link';

import { HeaderChrome } from '@/components/site/header-chrome';
import { SearchTrigger } from '@/components/site/search-trigger';
import { Wordmark } from '@/components/site/wordmark';
import { buttonVariants } from '@/components/ui/button';
import { collectionHasEntries } from '@/lib/content';
import { NAV } from '@/lib/site';

// Server Component. SPEC.md § Landing page sections — Header: wordmark left;
// Work, Writing, Lab, Open Source, About centre; ⌘K hint and "Start a
// project" right. Sticky, transparent at top, blurred plus a hairline border
// after 8px of scroll.
//
// Only two client islands live inside: HeaderChrome (scroll state) and
// SearchTrigger (opens the palette).
export function Header() {
  // SPEC.md § Content model: hide a nav item if its collection has zero
  // published entries.
  const nav = NAV.filter((i) => !i.collection || collectionHasEntries(i.collection));

  return (
    <HeaderChrome>
      <nav
        aria-label="Main"
        className="container-content flex h-14 items-center justify-between gap-6"
      >
        <Link
          href="/"
          className="text-fg rounded-[var(--radius-button)]"
          aria-label="Stackrel, home"
        >
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-small text-fg-muted hover:text-fg rounded-[var(--radius-button)] transition-colors duration-[var(--dur-instant)] ease-[var(--ease-out)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <SearchTrigger />
          <Link
            href="/contact"
            className={buttonVariants({ variant: 'primary', size: 'default' })}
          >
            Start a project
          </Link>
        </div>
      </nav>
    </HeaderChrome>
  );
}
