import { SectionLabel } from '@/components/ui/section-label';

export const metadata = { title: 'Open Source' };

// Placeholder route so the layout shell, navigation and command palette are
// complete in Phase 2. Real content arrives in Phase 4.
export default function Page() {
  return (
    <div className="container-content py-24">
      <SectionLabel>Open Source</SectionLabel>
      <h1 className="text-h1 text-fg mt-3">Open Source</h1>
      <p className="text-body text-fg-muted mt-4 max-w-prose">
        TODO: repo cards built from GitHub data at build time. Built in Phase 4.
      </p>
    </div>
  );
}
