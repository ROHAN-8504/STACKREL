'use client';

// "use client": next-themes writes the [data-theme] attribute from the
// browser (localStorage + prefers-color-scheme) and exposes it via React
// context. There is no server-rendered equivalent in a static export.
// SPEC.md § Tech stack — Theme: dark default, no flash on load.

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import type { ComponentProps } from 'react';

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemeProvider>) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
