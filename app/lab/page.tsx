import { SectionLabel } from '@/components/ui/section-label';

export const metadata = { title: 'Lab' };

// Placeholder route so the layout shell, navigation and command palette are
// complete in Phase 2. Real content arrives in Phase 4.
export default function Page() {
  return (
    <div className="container-content py-24">
      <SectionLabel>Lab</SectionLabel>
      <h1 className="text-h1 text-fg mt-3">Lab</h1>
      <p className="text-body text-fg-muted mt-4 max-w-prose">
        TODO: status-tagged experiments: running, shipped, killed, with results. Built in
        Phase 4.
      </p>
    </div>
  );
}
