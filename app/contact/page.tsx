import { SectionLabel } from '@/components/ui/section-label';

export const metadata = { title: 'Contact' };

// Placeholder route so the layout shell, navigation and command palette are
// complete in Phase 2. Real content arrives in Phase 5.
export default function Page() {
  return (
    <div className="container-content py-24">
      <SectionLabel>Contact</SectionLabel>
      <h1 className="text-h1 text-fg mt-3">Contact</h1>
      <p className="text-body text-fg-muted mt-4 max-w-prose">
        TODO: the contact form, posting to the /api/contact Worker. Built in Phase 5.
      </p>
    </div>
  );
}
