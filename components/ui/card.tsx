import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// SPEC.md § Core components — Card: --bg-subtle, 1px border, 12px radius;
// hover raises border to --border-strong and background to --bg-hover in 150ms.
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-border bg-bg-subtle rounded-[var(--radius-card)] border',
        'transition-[background-color,border-color] duration-[var(--dur-fast)]',
        'hover:border-border-strong hover:bg-bg-hover ease-[var(--ease-out)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 p-6', className)} {...props} />;
}

export function CardTitle({
  as: Tag = 'h3',
  className,
  ...props
}: ComponentProps<'h3'> & { as?: 'h2' | 'h3' | 'h4' }) {
  // The visual size is fixed by the token; the element is chosen by the
  // surrounding heading order (SPEC.md § SEO: no skipped levels).
  return <Tag className={cn('text-h3 text-fg', className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-small text-fg-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-3 p-6 pt-0', className)} {...props} />;
}
