import type { ReactNode } from 'react';

type TocItem = { title: string; url: string; items?: TocItem[] };

/**
 * Table of contents, built from Velite's s.toc() output.
 * Server Component: just links, no scroll-spy in v1.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-labelledby="toc-heading" className="flex flex-col gap-3">
      <p id="toc-heading" className="text-label text-fg-subtle font-mono uppercase">
        On this page
      </p>
      <List items={items} />
    </nav>
  );
}

function List({ items, depth = 0 }: { items: TocItem[]; depth?: number }): ReactNode {
  return (
    <ul className={depth > 0 ? 'mt-2 flex flex-col gap-2 pl-4' : 'flex flex-col gap-2'}>
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            className="text-small text-fg-muted hover:text-fg transition-colors duration-[var(--dur-instant)]"
          >
            {item.title}
          </a>
          {item.items && item.items.length > 0 ? (
            <List items={item.items} depth={depth + 1} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
