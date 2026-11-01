import { cn } from '@/lib/utils';

/**
 * Original Stackrel mark: three offset bars reading as stacked layers,
 * set beside the name in Geist.
 *
 * Drawn from scratch for this project. SPEC.md is explicit that Vercel's
 * logo, triangle mark and wordmark must not be copied — this shares no
 * geometry with them.
 */
export function Wordmark({
  className,
  showName = true,
}: {
  className?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="1" y="2.5" width="16" height="3" rx="1.5" fill="currentColor" />
        <rect
          x="1"
          y="7.5"
          width="11"
          height="3"
          rx="1.5"
          fill="currentColor"
          opacity="0.6"
        />
        <rect
          x="1"
          y="12.5"
          width="6"
          height="3"
          rx="1.5"
          fill="currentColor"
          opacity="0.3"
        />
      </svg>
      {showName ? (
        <span className="text-[15px] font-semibold tracking-[-0.02em]">Stackrel</span>
      ) : null}
    </span>
  );
}
