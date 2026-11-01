'use client';

// "use client": owns the palette's open state, the global ⌘K / Ctrl+K key
// handler, and the idle preload. SPEC.md § Command palette and
// § Perceived-speed requirements ("opens in under 50ms of the keypress:
// preload its index on idle").
//
// This provider is deliberately tiny. The palette itself — cmdk plus
// @radix-ui/react-dialog — is a separate chunk fetched during idle time, so
// it never counts against the first-load JS budget but is already in memory
// before the first keypress.

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { SearchDoc } from '@/lib/content';

type CommandMenuContextValue = { open: () => void };

const CommandMenuContext = createContext<CommandMenuContextValue>({
  open: () => undefined,
});

export function useCommandMenu(): CommandMenuContextValue {
  return useContext(CommandMenuContext);
}

/** Module-level so the chunk is fetched at most once. */
let modulePromise: Promise<{
  CommandMenu: typeof import('./command-menu').CommandMenu;
}> | null = null;

function loadCommandMenu() {
  modulePromise ??= import('./command-menu');
  return modulePromise;
}

const CommandMenu = dynamic(() => loadCommandMenu().then((m) => m.CommandMenu), {
  ssr: false,
});

function onIdle(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  // Safari has no requestIdleCallback; fall back to a short timeout.
  const ric: typeof window.requestIdleCallback | undefined =
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback.bind(window)
      : undefined;
  if (ric) {
    const id = ric(fn, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 1200);
  return () => window.clearTimeout(id);
}

export function CommandMenuProvider({
  children,
  docs,
}: {
  children: ReactNode;
  /** Content index, built at build time and passed in from the layout. */
  docs: SearchDoc[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Mounted (but closed) once the chunk has arrived, so opening is a state
  // flip rather than a network round-trip.
  const [ready, setReady] = useState(false);

  useEffect(() => onIdle(() => void loadCommandMenu().then(() => setReady(true))), []);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!ready) void loadCommandMenu().then(() => setReady(true));
  }, [ready]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((v) => !v);
        if (!ready) void loadCommandMenu().then(() => setReady(true));
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [ready]);

  const value = useMemo<CommandMenuContextValue>(() => ({ open }), [open]);

  return (
    <CommandMenuContext.Provider value={value}>
      {children}
      {(ready || isOpen) && (
        <CommandMenu open={isOpen} onOpenChange={setIsOpen} docs={docs} />
      )}
    </CommandMenuContext.Provider>
  );
}
