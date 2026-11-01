import { Reveal } from '@/components/site/reveal';
import { Section } from '@/components/site/sections/section';
import { PROCESS } from '@/lib/landing';

// SPEC.md § Landing page sections 5 — How we work: a 4-step horizontal
// process (scope, build, evaluate, ship and maintain).
export function Process() {
  return (
    <Section label={PROCESS.label} heading={PROCESS.heading}>
      <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {PROCESS.steps.map((step, i) => (
          <Reveal as="li" key={step.n} index={i} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-label text-fg-subtle font-mono">{step.n}</span>
              <span aria-hidden="true" className="bg-border h-px flex-1" />
            </div>
            <h3 className="text-h3 text-fg">{step.title}</h3>
            <p className="text-small text-fg-muted">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
