'use client';

// "use client": the palette is an interactive dialog with a text filter,
// keyboard navigation and clipboard/theme side effects. SPEC.md § Command
// palette. This module is loaded lazily (see command-menu-context.tsx) so
// cmdk and @radix-ui/react-dialog stay out of first-load JS.

import { Command } from 'cmdk';
import { Check, Copy, FileText, Home, Mail, Moon, Send, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';

import { Kbd } from '@/components/ui/kbd';
import { ROUTES, SITE } from '@/lib/site';

const ICONS: Record<string, typeof Home> = {
  '/': Home,
};

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const run = useCallback(
    (fn: () => void) => {
      fn();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  const copyEmail = useCallback(() => {
    void navigator.clipboard?.writeText(SITE.email).then(
      () => {
        // Confirm within 100ms (SPEC.md § Perceived-speed requirements).
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => undefined,
    );
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      shouldFilter
      overlayClassName="fixed inset-0 z-[var(--z-dialog)] bg-black/50 data-[state=open]:animate-[fade-in_var(--dur-base)_var(--ease-out)]"
      contentClassName="fixed left-1/2 top-[20vh] z-[var(--z-dialog)] w-[min(92vw,560px)] -translate-x-1/2 data-[state=open]:animate-[palette-in_var(--dur-base)_var(--ease-out)]"
      className="border-border-strong bg-bg-subtle overflow-hidden rounded-[var(--radius-dialog)] border shadow-2xl"
    >
      <div className="border-border flex items-center gap-3 border-b px-4">
        <Command.Input
          placeholder="Search pages and actions…"
          className="text-body text-fg placeholder:text-fg-subtle h-12 w-full bg-transparent outline-none"
        />
        <Kbd>Esc</Kbd>
      </div>

      <Command.List className="max-h-[400px] overflow-y-auto overscroll-contain p-2">
        <Command.Empty className="text-small text-fg-subtle px-3 py-8 text-center">
          No results.
        </Command.Empty>

        <Command.Group
          heading="Pages"
          className="[&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:text-fg-subtle [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase"
        >
          {ROUTES.map((route) => {
            const Icon = ICONS[route.href] ?? FileText;
            return (
              <Command.Item
                key={route.href}
                value={`${route.label} ${route.hint}`}
                onSelect={() => run(() => router.push(route.href))}
                className="text-small text-fg-muted data-[selected=true]:bg-bg-hover data-[selected=true]:text-fg flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{route.label}</span>
                <span className="text-fg-subtle ml-auto">{route.hint}</span>
              </Command.Item>
            );
          })}
        </Command.Group>

        <Command.Group
          heading="Actions"
          className="[&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:text-fg-subtle [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase"
        >
          <Command.Item
            value="Start a project contact"
            onSelect={() => run(() => router.push('/contact'))}
            className="text-small text-fg-muted data-[selected=true]:bg-bg-hover data-[selected=true]:text-fg flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2"
          >
            <Send className="size-4 shrink-0" aria-hidden="true" />
            Start a project
          </Command.Item>

          <Command.Item
            value="Copy email address"
            onSelect={copyEmail}
            className="text-small text-fg-muted data-[selected=true]:bg-bg-hover data-[selected=true]:text-fg flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2"
          >
            {copied ? (
              <Check className="text-success size-4 shrink-0" aria-hidden="true" />
            ) : (
              <Copy className="size-4 shrink-0" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy email'}
            <span className="text-fg-subtle ml-auto">{SITE.email}</span>
          </Command.Item>

          <Command.Item
            value="Toggle theme dark light"
            onSelect={() =>
              run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))
            }
            className="text-small text-fg-muted data-[selected=true]:bg-bg-hover data-[selected=true]:text-fg flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <Moon className="size-4 shrink-0" aria-hidden="true" />
            )}
            Toggle theme
          </Command.Item>

          <Command.Item
            value="Email Stackrel mailto"
            onSelect={() =>
              run(() => {
                window.location.href = `mailto:${SITE.email}`;
              })
            }
            className="text-small text-fg-muted data-[selected=true]:bg-bg-hover data-[selected=true]:text-fg flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2"
          >
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            Email us
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
