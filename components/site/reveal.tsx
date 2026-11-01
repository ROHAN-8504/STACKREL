'use client';

// "use client": scroll reveals need an IntersectionObserver.
//
// SPEC.md motion rule 3: fade 0 -> 1 and rise 8–12px, once per element,
// triggered at 15% visibility, staggered 50ms between siblings, at most 6
// staggered items.
//
// This replaces the `motion` package for reveals. The animation itself is
// CSS (transform + opacity only, per motion rule 1); all this component does
// is add a class when the element first becomes 15% visible. That keeps
// ~35KB of animation library out of a bundle that is already over budget.

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const MAX_STAGGER = 6;

export function Reveal({
  children,
  index = 0,
  as: Tag = 'div',
  className,
}: {
  children: ReactNode;
  /** Position among siblings; drives the 50ms stagger, capped at 6. */
  index?: number;
  as?: 'div' | 'li' | 'section';
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion needs no branch here: the stylesheet forces .reveal to
    // opacity 1 with no transition under prefers-reduced-motion, so adding
    // the class is a no-op visually (motion rule 9).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect(); // once per element
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', shown && 'is-revealed', className)}
      style={
        {
          '--reveal-delay': `${Math.min(index, MAX_STAGGER) * 50}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
