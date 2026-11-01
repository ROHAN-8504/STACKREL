import { SectionLabel } from '@/components/ui/section-label';

export function PageHeader({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="flex flex-col gap-3 pt-20 pb-10">
      <SectionLabel>{label}</SectionLabel>
      <h1 className="text-h1 text-fg max-w-[20ch]">{title}</h1>
      {intro ? <p className="text-body text-fg-muted max-w-prose">{intro}</p> : null}
    </div>
  );
}
