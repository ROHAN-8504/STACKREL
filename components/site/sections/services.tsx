import { Reveal } from '@/components/site/reveal';
import { Section } from '@/components/site/sections/section';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SERVICES } from '@/lib/landing';

// SPEC.md § Landing page sections 3 — What we build.
export function Services() {
  return (
    <Section label={SERVICES.label} heading={SERVICES.heading}>
      <ul className="grid gap-6 md:grid-cols-3">
        {SERVICES.items.map((item, i) => (
          <Reveal as="li" key={item.title} index={i}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
