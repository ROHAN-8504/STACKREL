import { ContactForm } from '@/components/site/contact-form';
import { PageHeader } from '@/components/site/page-header';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Start a project with Stackrel. Tell us what you are trying to ship.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="container-content pb-24">
      <PageHeader
        label="Contact"
        title="Start a project"
        intro="Tell us what you are trying to ship and what is in the way. The more concrete the better — constraints, deadlines and what you have already tried all help."
      />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
        <ContactForm />
        <aside className="text-small text-fg-muted flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-label text-fg-subtle font-mono uppercase">Response time</p>
            <p>Within two working days.</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-label text-fg-subtle font-mono uppercase">Prefer email?</p>
            <a
              href={`mailto:${SITE.email}`}
              className="text-fg underline underline-offset-4"
            >
              {SITE.email}
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-label text-fg-subtle font-mono uppercase">
              What to include
            </p>
            <ul className="marker:text-fg-subtle flex list-disc flex-col gap-1.5 pl-4">
              <li>The outcome you need, not the implementation</li>
              <li>Any hard deadline</li>
              <li>What exists already</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
