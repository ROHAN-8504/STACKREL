import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// SPEC.md § Core components — Section label: small mono uppercase label
// above each landing section heading.
export function SectionLabel({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-label text-fg-subtle font-mono uppercase', className)}
      {...props}
    />
  );
}
