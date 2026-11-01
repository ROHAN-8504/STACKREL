'use client';

// "use client": writes to the clipboard and shows a confirmation.
// SPEC.md § Core components — Code block: "copy button with a check-mark
// confirmation", and § Perceived-speed: feedback within 100ms.

import { useCallback, useState } from 'react';

import { CheckIcon, CopyIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    void navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => undefined,
    );
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-[4px]',
        'border-border text-fg-subtle border',
        'transition-colors duration-[var(--dur-instant)] ease-[var(--ease-out)]',
        'hover:border-border-strong hover:text-fg',
      )}
    >
      {copied ? (
        <CheckIcon className="text-success size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </button>
  );
}
