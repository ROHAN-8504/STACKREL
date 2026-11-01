import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// SPEC.md § Core components — Button.
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[var(--radius-button)] font-medium',
    'transition-[background-color,border-color,color,transform] duration-[var(--dur-instant)]',
    'ease-[var(--ease-out)]',
    'active:scale-[0.98]', // motion rule 6
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg hover:opacity-90',
        secondary:
          'border border-border bg-transparent text-fg hover:border-border-strong hover:bg-bg-hover',
        ghost: 'bg-transparent text-fg-muted hover:bg-bg-hover hover:text-fg',
      },
      size: {
        default: 'h-9 px-4 text-small',
        lg: 'h-10 px-5 text-body',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
