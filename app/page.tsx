import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { SectionLabel } from '@/components/ui/section-label';

// Phase 1 placeholder. The nine-section landing page is Phase 3; the layout
// shell (header, footer, palette) is Phase 2.
export default function HomePage() {
  return (
    <main id="main" className="relative min-h-dvh">
      <div
        className="bg-grid pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <div className="container-content flex min-h-dvh flex-col justify-center gap-8 py-24">
        <SectionLabel>Phase 1 — scaffold and tokens</SectionLabel>
        <h1 className="text-display text-fg max-w-[20ch]">TODO: positioning line</h1>
        <p className="text-body text-fg-muted max-w-prose">
          TODO: sub-line. Three candidates are listed under “Open decisions for Rohan” in
          SPEC.md; none has been chosen, so nothing is written here yet.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg">
            Start a project
          </Button>
          <Button variant="secondary" size="lg">
            See the work
          </Button>
        </div>
        <p className="text-small text-fg-subtle">
          Command palette arrives in Phase 2 — <Kbd>⌘</Kbd> <Kbd>K</Kbd>
        </p>
      </div>
    </main>
  );
}
