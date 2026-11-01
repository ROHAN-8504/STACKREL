import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// SPEC.md § Core components — Badge: mono label, pill, hairline border;
// status variants fill with the status colour at 15% opacity.
// Accessibility: status badges carry text, never colour alone.
const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border',
    'px-2.5 py-0.5 font-mono text-label uppercase',
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-bg-subtle text-fg-muted',
        outline: 'border-border-strong bg-transparent text-fg',
        success:
          'border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_15%,var(--bg-subtle))] text-success',
        warning:
          'border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_15%,var(--bg-subtle))] text-warning',
        error:
          'border-[color-mix(in_srgb,var(--error)_35%,transparent)] bg-[color-mix(in_srgb,var(--error)_15%,var(--bg-subtle))] text-error',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
