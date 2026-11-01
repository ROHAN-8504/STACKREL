'use client';

// "use client": the spotlight follows the cursor, which needs a pointer
// listener. SPEC.md § Core components — Card: "Optional spotlight effect
// (radial gradient following the cursor) on featured cards only."
//
// Writes two CSS custom properties and nothing else — no React state, so
// moving the pointer never triggers a re-render.

import { useCallback, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  }, []);

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={cn('spotlight', className)}>
      {children}
    </div>
  );
}
