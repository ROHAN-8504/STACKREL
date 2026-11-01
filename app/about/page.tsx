import { SectionLabel } from '@/components/ui/section-label';

export const metadata = { title: 'About' };

// Placeholder route so the layout shell, navigation and command palette are
// complete in Phase 2. Real content arrives in Phase 3.
export default function Page() {
  return (
    <div className="container-content py-24">
      <SectionLabel>About</SectionLabel>
      <h1 className="text-h1 text-fg mt-3">About</h1>
      <p className="text-body text-fg-muted mt-4 max-w-prose">
        TODO: what Stackrel is, its principles, and how engagements run. Built in Phase 3.
      </p>
    </div>
  );
}
