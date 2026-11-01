import { SectionLabel } from '@/components/ui/section-label';

export const metadata = { title: 'Writing' };

// Placeholder route so the layout shell, navigation and command palette are
// complete in Phase 2. Real content arrives in Phase 4.
export default function Page() {
  return (
    <div className="container-content py-24">
      <SectionLabel>Writing</SectionLabel>
      <h1 className="text-h1 text-fg mt-3">Writing</h1>
      <p className="text-body text-fg-muted mt-4 max-w-prose">
        TODO: write-ups, breakdowns and learnings with date, tags, reading time and a tag
        filter. Built in Phase 4.
      </p>
    </div>
  );
}
