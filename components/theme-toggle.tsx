'use client';

// "use client": reads and writes the active theme through next-themes and
// responds to a click. SPEC.md § Landing page — Footer theme toggle.

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons';

const ORDER = ['dark', 'light', 'system'] as const;
const LABEL = { dark: 'Dark', light: 'Light', system: 'System' } as const;

const noopSubscribe = () => () => {};

/**
 * True only after hydration. The server-rendered HTML cannot know the
 * resolved theme, so the icon renders as a blank placeholder on the server
 * and resolves on the client. useSyncExternalStore gives the server and
 * client different snapshots without a setState-in-effect cascade.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const current = (theme ?? 'system') as (typeof ORDER)[number];
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? 'dark';

  const Icon =
    current === 'dark' ? MoonIcon : current === 'light' ? SunIcon : MonitorIcon;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        hydrated ? `Theme: ${LABEL[current]}. Switch to ${LABEL[next]}.` : 'Change theme'
      }
      onClick={() => setTheme(next)}
    >
      {hydrated ? <Icon aria-hidden="true" /> : <span className="size-4" />}
    </Button>
  );
}
