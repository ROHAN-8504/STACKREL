import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { CopyButton } from '@/components/mdx/copy-button';

// Radix Tabs costs ~12KB gzipped and most articles have no tabs, so the
// component is split out and fetched only by pages that actually use it.
const MdxTabs = dynamic(() => import('@/components/mdx/mdx-tabs').then((m) => m.MdxTabs));
import { ArrowRightIcon, ExternalIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * Components available inside MDX — SPEC.md § Content model:
 * Callout, CodeBlock (with filename), Figure, Tabs, Steps, Metric,
 * Diagram and LinkCard, plus styled defaults for plain markdown.
 *
 * All Server Components except CopyButton and MdxTabs.
 */

// ---------------------------------------------------------------- Callout
const CALLOUT = {
  note: { border: 'border-border-strong', dot: 'bg-fg-muted', label: 'Note' },
  warning: {
    border: 'border-[color-mix(in_srgb,var(--warning)_40%,transparent)]',
    dot: 'bg-warning',
    label: 'Warning',
  },
  tip: {
    border: 'border-[color-mix(in_srgb,var(--success)_40%,transparent)]',
    dot: 'bg-success',
    label: 'Tip',
  },
} as const;

export function Callout({
  type = 'note',
  children,
}: {
  type?: keyof typeof CALLOUT;
  children: ReactNode;
}) {
  const v = CALLOUT[type] ?? CALLOUT.note;
  return (
    <aside
      className={cn(
        'bg-bg-subtle my-6 rounded-[var(--radius-card)] border px-5 py-4',
        v.border,
      )}
    >
      <p className="text-label text-fg-subtle mb-2 flex items-center gap-2 font-mono uppercase">
        <span aria-hidden="true" className={cn('size-1.5 rounded-full', v.dot)} />
        {v.label}
      </p>
      <div className="text-small text-fg-muted [&>p]:my-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  );
}

// -------------------------------------------------------------- CodeBlock
// rehype-pretty-code emits <pre data-language=…>; `filename` comes from the
// MDX fence meta. The copy button reads the raw text rehype attaches.
export function Pre({
  children,
  raw,
  filename,
  ...props
}: ComponentProps<'pre'> & { raw?: string; filename?: string }) {
  return (
    <figure className="border-border bg-bg-subtle my-6 overflow-hidden rounded-[var(--radius-card)] border">
      <figcaption className="border-border flex items-center justify-between gap-4 border-b px-4 py-2">
        <span className="text-label text-fg-subtle font-mono">{filename ?? 'code'}</span>
        {raw ? <CopyButton value={raw} /> : null}
      </figcaption>
      <pre
        {...props}
        className="overflow-x-auto px-4 py-4 text-[13px] leading-6 [&_code]:font-mono"
      >
        {children}
      </pre>
    </figure>
  );
}

// ----------------------------------------------------------------- Figure
export function Figure({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- the static
          export sets images.unoptimized, so next/image emits the same
          markup while shipping its client runtime. width/height are set,
          so there is no layout shift. */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="border-border h-auto w-full rounded-[var(--radius-card)] border"
      />
      {caption ? (
        <figcaption className="text-small text-fg-subtle mt-3">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

// ------------------------------------------------------------------ Steps
export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="border-border my-8 border-l pl-6 [counter-reset:step] [&>h3]:mt-8 [&>h3]:first:mt-0">
      {children}
    </div>
  );
}

// ----------------------------------------------------------------- Metric
export function Metric({ label, value }: { label: string; value: string }) {
  // A value of "TODO" renders as an em dash rather than the literal word,
  // so an unfilled figure never reads as a real one.
  const pending = value.trim().toUpperCase() === 'TODO' || value.trim() === '';
  return (
    <div className="border-border bg-bg-subtle my-4 inline-flex min-w-40 flex-col gap-1 rounded-[var(--radius-card)] border px-5 py-4">
      <span className="text-label text-fg-subtle font-mono uppercase">{label}</span>
      <span className="text-h2 text-fg">
        {pending ? (
          <span className="text-fg-subtle" title="Not yet published">
            —
          </span>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- Diagram
export function Diagram({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="border-border bg-bg-subtle my-8 rounded-[var(--radius-card)] border p-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG diagrams
          are already optimised and must not be rasterised. */}
      <img src={src} alt={alt} className="w-full" />
      {caption ? (
        <figcaption className="text-small text-fg-subtle mt-4">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

// --------------------------------------------------------------- LinkCard
export function LinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description?: string;
}) {
  const external = href.startsWith('http');
  const inner = (
    <>
      <span className="text-fg flex items-center gap-2">
        {title}
        {external ? (
          <ExternalIcon className="text-fg-subtle size-3.5" />
        ) : (
          <ArrowRightIcon className="text-fg-subtle size-3.5" />
        )}
      </span>
      {description ? (
        <span className="text-small text-fg-muted block">{description}</span>
      ) : null}
    </>
  );
  const className =
    'my-6 flex flex-col gap-1 rounded-[var(--radius-card)] border border-border bg-bg-subtle px-5 py-4 no-underline transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:border-border-strong hover:bg-bg-hover';

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

// ------------------------------------------------- markdown element styles
export const mdxComponents = {
  Callout,
  CodeBlock: Pre,
  Figure,
  Tabs: MdxTabs,
  Steps,
  Metric,
  Diagram,
  LinkCard,

  pre: Pre,
  h2: (p: ComponentProps<'h2'>) => (
    <h2 {...p} className="text-h2 text-fg mt-14 mb-4 scroll-mt-24" />
  ),
  h3: (p: ComponentProps<'h3'>) => (
    <h3 {...p} className="text-h3 text-fg mt-10 mb-3 scroll-mt-24" />
  ),
  p: (p: ComponentProps<'p'>) => <p {...p} className="text-body text-fg-muted my-4" />,
  ul: (p: ComponentProps<'ul'>) => (
    <ul
      {...p}
      className="text-body text-fg-muted marker:text-fg-subtle my-4 list-disc pl-6"
    />
  ),
  ol: (p: ComponentProps<'ol'>) => (
    <ol
      {...p}
      className="text-body text-fg-muted marker:text-fg-subtle my-4 list-decimal pl-6"
    />
  ),
  li: (p: ComponentProps<'li'>) => <li {...p} className="my-1.5" />,
  blockquote: (p: ComponentProps<'blockquote'>) => (
    <blockquote
      {...p}
      className="text-body border-border-strong text-fg-muted my-6 border-l-2 pl-5 italic"
    />
  ),
  code: (p: ComponentProps<'code'>) => (
    <code
      {...p}
      className="border-border bg-bg-subtle text-fg rounded-[4px] border px-1.5 py-0.5 font-mono text-[0.9em]"
    />
  ),
  a: ({ href = '', ...p }: ComponentProps<'a'>) =>
    href.startsWith('http') ? (
      // SPEC.md § Content and output safety: external links get rel.
      <a
        {...p}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-fg underline underline-offset-4"
      />
    ) : (
      <Link {...p} href={href} className="text-fg underline underline-offset-4" />
    ),
  table: (p: ComponentProps<'table'>) => (
    <div className="my-6 overflow-x-auto">
      <table {...p} className="text-small w-full border-collapse" />
    </div>
  ),
  th: (p: ComponentProps<'th'>) => (
    <th
      {...p}
      className="text-label border-border text-fg-subtle border-b py-3 pr-4 text-left font-mono uppercase"
    />
  ),
  td: (p: ComponentProps<'td'>) => (
    <td {...p} className="border-border text-fg-muted border-b py-3 pr-4" />
  ),
  hr: (p: ComponentProps<'hr'>) => <hr {...p} className="border-border my-12" />,
};
