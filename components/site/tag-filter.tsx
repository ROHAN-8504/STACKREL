'use client';

// "use client": the tag filter and the "/" search shortcut are interactive
// and must not cause a navigation. SPEC.md § Content model (tag filter) and
// § Keyboard-first UX ("/ focuses search on list pages").
//
// Filtering happens in the browser over an already-rendered list, so there
// is no request and no layout shift.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';

export type FilterableItem = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  node: ReactNode;
};

export function TagFilter({
  items,
  tags,
  emptyLabel = 'Nothing matches that filter.',
}: {
  items: FilterableItem[];
  tags: string[];
  emptyLabel?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      // Don't hijack "/" while the visitor is typing somewhere else.
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable))
        return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const tagOk = !active || i.tags.includes(active);
      const qOk =
        !q || i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q);
      return tagOk && qOk;
    });
  }, [items, active, query]);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4">
        <div className="relative max-w-sm">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title or summary"
            aria-label="Filter entries"
            className={cn(
              'text-small border-border h-9 w-full rounded-[var(--radius-button)] border',
              'bg-bg-subtle text-fg placeholder:text-fg-subtle pr-12 pl-3',
              'hover:border-border-strong transition-colors duration-[var(--dur-instant)]',
            )}
          />
          <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
            <Kbd>/</Kbd>
          </span>
        </div>

        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Filter by tag">
            <li>
              <FilterChip active={active === null} onClick={() => setActive(null)}>
                All
              </FilterChip>
            </li>
            {tags.map((t) => (
              <li key={t}>
                <FilterChip
                  active={active === t}
                  onClick={() => setActive(active === t ? null : t)}
                >
                  {t}
                </FilterChip>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} of {items.length} entries shown
      </p>

      {shown.length === 0 ? (
        <p className="text-body text-fg-muted">{emptyLabel}</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {shown.map((i) => (
            <li key={i.slug} className="relative">
              {i.node}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="cursor-pointer"
    >
      <Badge variant={active ? 'outline' : 'default'}>{children}</Badge>
    </button>
  );
}
