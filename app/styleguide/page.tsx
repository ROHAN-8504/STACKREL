import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { SectionLabel } from '@/components/ui/section-label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// SPEC.md Phase 1 acceptance: "a /styleguide page (dev only)".
//
// A static export has no middleware or request-time gate, and Next refuses an
// empty generateStaticParams() under `output: 'export'`, so the route cannot
// gate itself. It is pruned from `out/` after the build instead — see
// scripts/prune-dev-routes.mjs, which runs as part of `pnpm build`.
//
// Build it with: pnpm build:styleguide
export const metadata = { title: 'Styleguide', robots: { index: false, follow: false } };

const SURFACES = [
  ['--bg', 'Page background'],
  ['--bg-subtle', 'Cards, code blocks'],
  ['--bg-hover', 'Hovered cards and rows'],
] as const;

const BORDERS = [
  ['--border', 'Hairlines'],
  ['--border-strong', 'Hovered borders, inputs'],
] as const;

const TEXT = [
  ['--fg', 'Primary text'],
  ['--fg-muted', 'Secondary text'],
  ['--fg-subtle', 'Captions, metadata'],
] as const;

const STATUS = [
  ['--success', 'success'],
  ['--warning', 'warning'],
  ['--error', 'error'],
] as const;

const TYPE = [
  ['Display', 'text-display', 'clamp(40px, 6vw, 72px) / 1.05 · 600 · -0.04em'],
  ['H1', 'text-h1', '40px / 1.1 · 600 · -0.03em'],
  ['H2', 'text-h2', '28px / 1.2 · 600 · -0.02em'],
  ['H3', 'text-h3', '20px / 1.3 · 600 · -0.01em'],
  ['Body', 'text-body', '16px / 1.6 · 400 · 0'],
  ['Small', 'text-small', '14px / 1.5 · 400 · 0'],
] as const;

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

const DURATIONS = [
  ['--dur-instant', '100ms', 'Hover colour and border, button press'],
  ['--dur-fast', '150ms', 'Dropdowns, tooltips, toggles'],
  ['--dur-base', '250ms', 'Dialog and palette open, tab indicator'],
  ['--dur-slow', '500ms', 'Scroll reveals, hero entrance'],
] as const;

const EASINGS = [
  ['--ease-out', 'cubic-bezier(0.16, 1, 0.3, 1)', 'Entering'],
  ['--ease-in-out', 'cubic-bezier(0.65, 0, 0.35, 1)', 'Moving between positions'],
  ['--ease-in', 'cubic-bezier(0.7, 0, 0.84, 0)', 'Leaving'],
] as const;

// Measured with the WCAG formula against the worst-case surface in each
// theme. Deviations from the SPEC token table are called out in the Phase 1
// report; the two marked "raised" are the ones the spec's own hex values failed.
const CONTRAST = [
  ['--fg', '#EDEDED', '#171717', '16.91', '17.93', 'pass'],
  ['--fg-muted', '#A1A1A1', '#666666', '6.74', '5.13', 'pass'],
  ['--fg-subtle', '#828282', '#6E6E6E', '4.53', '4.55', 'raised'],
  ['--success', '#8ECCAB', '#2A6F4A', '7.68', '4.69', 'derived'],
  ['--warning', '#DEBE7C', '#825E17', '7.88', '4.61', 'derived'],
  ['--error', '#DD847E', '#8F261E', '5.58', '6.30', 'derived'],
] as const;

function Swatch({ token, use }: { token: string; use: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="border-border size-12 shrink-0 rounded-[var(--radius-button)] border"
        style={{ background: `var(${token})` }}
      />
      <div className="min-w-0">
        <p className="text-small text-fg font-mono">{token}</p>
        <p className="text-small text-fg-subtle">{use}</p>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border flex flex-col gap-6 border-t py-12">
      <div className="flex flex-col gap-2">
        <SectionLabel>{label}</SectionLabel>
        <h2 className="text-h2 text-fg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main id="main" className="container-content py-16">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <div className="flex flex-col gap-3">
          <SectionLabel>Stackrel · design system</SectionLabel>
          <h1 className="text-h1 text-fg">Styleguide</h1>
          <p className="text-body text-fg-muted max-w-prose">
            Every token and primitive built in Phase 1. Switch the theme to check both
            palettes — nothing here uses an ad-hoc hex value.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-small text-fg-subtle">Theme</span>
          <ThemeToggle />
        </div>
      </header>

      <Section label="Colour" title="Surfaces and borders">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SURFACES.map(([t, u]) => (
            <Swatch key={t} token={t} use={u} />
          ))}
          {BORDERS.map(([t, u]) => (
            <Swatch key={t} token={t} use={u} />
          ))}
          <Swatch token="--accent" use="Primary button fill" />
          <Swatch token="--accent-fg" use="Text on accent (added)" />
        </div>
      </Section>

      <Section label="Colour" title="Text and status">
        <div className="flex flex-col gap-4">
          {TEXT.map(([t, u]) => (
            <p key={t} className="text-body" style={{ color: `var(${t})` }}>
              {t} — {u} — The quick brown fox jumps over the lazy dog.
            </p>
          ))}
        </div>
        <Row>
          {STATUS.map(([t, v]) => (
            <Badge key={t} variant={v}>
              {v}
            </Badge>
          ))}
          <Badge>default</Badge>
          <Badge variant="outline">outline</Badge>
        </Row>
      </Section>

      <Section label="Accessibility" title="Measured contrast">
        <div className="overflow-x-auto">
          <table className="text-small w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-border border-b text-left">
                <th className="text-label text-fg-subtle py-3 pr-4 font-mono uppercase">
                  Token
                </th>
                <th className="text-label text-fg-subtle py-3 pr-4 font-mono uppercase">
                  Dark
                </th>
                <th className="text-label text-fg-subtle py-3 pr-4 font-mono uppercase">
                  Light
                </th>
                <th className="text-label text-fg-subtle py-3 pr-4 font-mono uppercase">
                  Dark ratio
                </th>
                <th className="text-label text-fg-subtle py-3 pr-4 font-mono uppercase">
                  Light ratio
                </th>
                <th className="text-label text-fg-subtle py-3 font-mono uppercase">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {CONTRAST.map(([token, dark, light, dr, lr, note]) => (
                <tr key={token} className="border-border border-b">
                  <td className="text-fg py-3 pr-4 font-mono">{token}</td>
                  <td className="text-fg-muted py-3 pr-4 font-mono">{dark}</td>
                  <td className="text-fg-muted py-3 pr-4 font-mono">{light}</td>
                  <td className="text-fg-muted py-3 pr-4 font-mono">{dr}:1</td>
                  <td className="text-fg-muted py-3 pr-4 font-mono">{lr}:1</td>
                  <td className="py-3">
                    <Badge variant={note === 'pass' ? 'success' : 'warning'}>
                      {note}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-small text-fg-subtle max-w-prose">
          Ratios are against the worst-case surface in each theme (--bg-hover for text,
          the composited badge fill for status). AA needs 4.5:1 for body text.
        </p>
      </Section>

      <Section label="Type" title="Geist Sans">
        <div className="flex flex-col gap-8">
          {TYPE.map(([name, cls, meta]) => (
            <div key={name} className="flex flex-col gap-2">
              <p className="text-label text-fg-subtle font-mono uppercase">
                {name} · {meta}
              </p>
              <p className={`${cls} text-fg`}>Stackrel ships production AI</p>
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <p className="text-label text-fg-subtle font-mono uppercase">
              Label (mono, uppercase) · 12px / 1.4 · 500 · +0.04em
            </p>
            <p className="text-label text-fg font-mono uppercase">Section label</p>
          </div>
        </div>
      </Section>

      <Section label="Type" title="Geist Mono">
        <p className="text-body text-fg font-mono">
          0123456789 · const ship = await evaluate(agent);
        </p>
      </Section>

      <Section label="Components" title="Button">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </Row>
        <Row>
          <Button size="lg" variant="primary">
            Large 40px
          </Button>
          <Button size="default" variant="primary">
            Default 36px
          </Button>
        </Row>
      </Section>

      <Section label="Components" title="Card">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Case study</CardTitle>
              <CardDescription>
                Hover to see the border and background transition over 150ms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-small text-fg-subtle">
                TODO: real content arrives with the content system in Phase 4.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="default">mdx</Badge>
              <Badge variant="default">static</Badge>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lab experiment</CardTitle>
              <CardDescription>
                Status badges carry text, never colour alone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Row>
                <Badge variant="success">shipped</Badge>
                <Badge variant="warning">running</Badge>
                <Badge variant="error">killed</Badge>
              </Row>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section label="Components" title="Tabs">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-body text-fg-muted">
              The underline slides with transform only. Phase 3 swaps the CSS transition
              for the motion spring.
            </p>
          </TabsContent>
          <TabsContent value="architecture">
            <p className="text-body text-fg-muted">
              Keyboard: arrow keys move between tabs.
            </p>
          </TabsContent>
          <TabsContent value="results">
            <p className="text-body text-fg-muted">
              Radix keeps its own ARIA and focus handling.
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section label="Components" title="Kbd">
        <Row>
          <span className="text-small text-fg-muted">Command palette</span>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span className="text-small text-fg-muted">· Search</span>
          <Kbd>/</Kbd>
          <span className="text-small text-fg-muted">· Close</span>
          <Kbd>Esc</Kbd>
        </Row>
      </Section>

      <Section label="Scale" title="Spacing, radius, layers">
        <div className="flex flex-col gap-3">
          {SPACING.map((s) => (
            <div key={s} className="flex items-center gap-4">
              <span className="text-small text-fg-subtle w-12 font-mono">{s}</span>
              <div
                className="bg-fg-muted h-3 rounded-[2px]"
                style={{ width: `${s}px` }}
              />
            </div>
          ))}
        </div>
        <Row>
          {[
            ['6px', 'var(--radius-button)', 'Buttons, inputs'],
            ['12px', 'var(--radius-card)', 'Cards'],
            ['16px', 'var(--radius-dialog)', 'Dialogs'],
            ['full', 'var(--radius-full)', 'Badges'],
          ].map(([label, v, use]) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className="border-border-strong bg-bg-subtle size-16 border"
                style={{ borderRadius: v }}
              />
              <span className="text-label text-fg-subtle font-mono">{label}</span>
              <span className="text-fg-subtle text-[11px]">{use}</span>
            </div>
          ))}
        </Row>
        <p className="text-small text-fg-muted font-mono">
          z: header 40 · popovers 50 · dialog and palette 60 · toast 70
        </p>
      </Section>

      <Section label="Motion" title="Duration and easing">
        <div className="flex flex-col gap-2">
          {DURATIONS.map(([t, v, use]) => (
            <p key={t} className="text-small">
              <span className="text-fg font-mono">{t}</span>{' '}
              <span className="text-fg-muted font-mono">{v}</span>{' '}
              <span className="text-fg-subtle">— {use}</span>
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {EASINGS.map(([t, v, use]) => (
            <p key={t} className="text-small">
              <span className="text-fg font-mono">{t}</span>{' '}
              <span className="text-fg-muted font-mono">{v}</span>{' '}
              <span className="text-fg-subtle">— {use}</span>
            </p>
          ))}
        </div>
        <p className="text-small text-fg-subtle max-w-prose">
          Motion rule 1: only transform and opacity animate. Under prefers-reduced-motion
          only colour transitions survive.
        </p>
      </Section>
    </main>
  );
}
