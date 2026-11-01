import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ViewTransition } from 'react';

import { CommandMenuProvider } from '@/components/site/command-menu-context';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { ThemeProvider } from '@/components/theme-provider';
import { searchIndex } from '@/lib/content';
import { SITE } from '@/lib/site';

import './globals.css';

// Full metadata, JSON-LD and OG images land in Phase 6.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s — ${SITE.name}` },
  description: 'TODO: positioning line — see SPEC.md § Open decisions for Rohan.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Built at build time and handed to the client palette as plain data.
  const docs = searchIndex();

  return (
    // suppressHydrationWarning: next-themes sets [data-theme] before paint,
    // so the server HTML and first client render differ on this attribute
    // by design.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} relative flex min-h-dvh flex-col font-sans`}
      >
        <ThemeProvider>
          <CommandMenuProvider docs={docs}>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Header />
            {/* Cross-fade between routes (motion rule 5). Browsers without
                the View Transitions API get an instant swap. */}
            <ViewTransition>
              <main id="main" className="flex-1">
                {children}
              </main>
            </ViewTransition>
            <Footer />
          </CommandMenuProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
