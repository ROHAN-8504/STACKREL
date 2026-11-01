import type { ReactNode } from 'react';

import { SectionLabel } from '@/components/ui/section-label';
import { cn } from '@/lib/utils';

// Shared section frame. SPEC.md § Spacing: sections separated by 96–128px,
// each introduced by a small mono uppercase label above its heading.
export function Section({
  label,
  heading,
  children,
  className,
  id,
}: {
  label: string;
  heading?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('container-content py-24', className)}>
      <div className="flex flex-col gap-3">
        <SectionLabel>{label}</SectionLabel>
        {heading ? <h2 className="text-h2 text-fg max-w-[22ch]">{heading}</h2> : null}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}
