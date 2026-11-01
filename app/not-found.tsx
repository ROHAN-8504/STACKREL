import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';

export const metadata = { title: 'Page not found' };

// SPEC.md Phase 2: custom 404.
export default function NotFound() {
  return (
    <div className="container-content flex min-h-[60vh] flex-col justify-center gap-6 py-24">
      <SectionLabel>404</SectionLabel>
      <h1 className="text-h1 text-fg">This page doesn’t exist</h1>
      <p className="text-body text-fg-muted max-w-prose">
        The link may be out of date, or the page may have moved. Try the work, the
        writing, or search with <span className="font-mono">⌘K</span>.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className={buttonVariants({ variant: 'primary' })}>
          Back home
        </Link>
        <Link href="/work" className={buttonVariants({ variant: 'secondary' })}>
          See the work
        </Link>
      </div>
    </div>
  );
}
