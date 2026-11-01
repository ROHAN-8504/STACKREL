import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';
import { Wordmark } from '@/components/site/wordmark';
import { FOOTER_COLUMNS, SITE, SOCIAL } from '@/lib/site';

// Server component: static links only. The theme toggle inside it is the
// single client island. SPEC.md § Landing page sections — Footer.
export function Footer() {
  const social = SOCIAL.filter((s) => s.url !== '');

  return (
    <footer className="border-border mt-32 border-t">
      <div className="container-content flex flex-col gap-12 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <Wordmark className="text-fg" />
            <a
              href={`mailto:${SITE.email}`}
              className="text-small text-fg-muted hover:text-fg transition-colors duration-[var(--dur-instant)]"
            >
              {SITE.email}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <nav
                key={col.heading}
                aria-label={col.heading}
                className="flex flex-col gap-3"
              >
                <p className="text-label text-fg-subtle font-mono uppercase">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => {
                    // A feed is a file, not a route: a next/link would make
                    // the router prefetch an RSC payload for it and 404.
                    const isFile = /\.[a-z0-9]+$/i.test(link.href);
                    const linkClass =
                      'text-small text-fg-muted hover:text-fg transition-colors duration-[var(--dur-instant)]';
                    return (
                      <li key={link.href}>
                        {isFile ? (
                          <a href={link.href} className={linkClass}>
                            {link.label}
                          </a>
                        ) : (
                          <Link href={link.href} className={linkClass}>
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-border flex flex-col-reverse items-start justify-between gap-6 border-t pt-8 sm:flex-row sm:items-center">
          <p className="text-small text-fg-subtle">
            © {new Date().getFullYear()} {SITE.name}
          </p>

          <div className="flex items-center gap-4">
            {social.length > 0 ? (
              <ul className="flex items-center gap-4">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-small text-fg-muted hover:text-fg transition-colors duration-[var(--dur-instant)]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              // Rendered rather than hidden so the gap is visible in review;
              // no invented handles ship. See lib/site.ts SOCIAL.
              <span className="text-small text-fg-subtle">TODO: social links</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
