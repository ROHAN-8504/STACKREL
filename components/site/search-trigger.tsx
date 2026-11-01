'use client';

// "use client": a button that opens the command palette through context.
// Kept separate from the header so the rest of the header stays server-rendered.

import { useCommandMenu } from '@/components/site/command-menu-context';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';

export function SearchTrigger() {
  const { open } = useCommandMenu();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open command palette"
      className={cn(
        'hidden items-center gap-2 rounded-[var(--radius-button)] sm:inline-flex',
        'border-border bg-bg-subtle border px-2.5 py-1.5',
        'text-small text-fg-subtle',
        'transition-colors duration-[var(--dur-instant)] ease-[var(--ease-out)]',
        'hover:border-border-strong hover:text-fg-muted',
      )}
    >
      <span>Search</span>
      <Kbd>⌘K</Kbd>
    </button>
  );
}
