'use client';

// "use client": Radix Tabs is a stateful, context-driven primitive, and the
// sliding indicator must measure the active trigger in the DOM. Both need the
// client. SPEC.md § Core components — Tabs.
//
// The indicator slides with `transform` only (translateX + scaleX), never
// `width`, per motion rule 1. Phase 3 swaps the CSS transition for the
// `motion` spring (stiffness 400, damping 30) once that dependency lands.

import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from 'react';

import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

type ListProps = ComponentProps<typeof TabsPrimitive.List>;

export function TabsList({ className, children, ...props }: ListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; scale: number } | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-state="active"]');
    if (!active) return;
    const listBox = list.getBoundingClientRect();
    if (listBox.width === 0) return;
    const activeBox = active.getBoundingClientRect();
    setIndicator({
      x: activeBox.left - listBox.left,
      scale: activeBox.width / listBox.width,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, children]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Re-measure on resize and whenever Radix flips data-state.
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    const mo = new MutationObserver(measure);
    mo.observe(list, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [measure]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      className={cn('border-border relative flex items-center gap-6 border-b', className)}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          'bg-fg pointer-events-none absolute -bottom-px left-0 h-px w-full origin-left',
          'transition-transform duration-[var(--dur-base)] ease-[var(--ease-in-out)]',
          indicator ? 'opacity-100' : 'opacity-0',
        )}
        style={
          indicator
            ? { transform: `translateX(${indicator.x}px) scaleX(${indicator.scale})` }
            : undefined
        }
      />
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative -mb-px cursor-pointer border-b-2 border-transparent pt-2 pb-3',
        'text-small text-fg-muted',
        'transition-colors duration-[var(--dur-instant)] ease-[var(--ease-out)]',
        'hover:text-fg data-[state=active]:text-fg',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('pt-6', className)} {...props} />;
}
