import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// SPEC.md § Core components — Kbd: small mono chip for shortcuts (⌘K).
export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-[4px]',
        'border-border bg-bg-subtle border px-1.5',
        'text-fg-muted font-mono text-[11px] leading-none',
        className,
      )}
      {...props}
    />
  );
}
