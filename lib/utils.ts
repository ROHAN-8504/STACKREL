import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge needs to be told about our custom type scale.
 *
 * Without this it cannot tell `text-body` (a font size from the SPEC
 * typography table) from `text-accent-fg` (a colour), puts both in its
 * `text-*` bucket, and silently drops the earlier one — so a Button that
 * sets both a colour and a size loses its colour.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'body', 'small', 'label'] }],
    },
  },
});

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
