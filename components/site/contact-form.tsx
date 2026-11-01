'use client';

// "use client": a form with validation state, a Turnstile widget and an
// async submit. SPEC.md § Contact form.
//
// The payload mirrors worker/schema.ts exactly — the Worker rejects
// unknown fields, so the two must stay in step.

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PROJECT_TYPES = [
  { value: 'ai-agent', label: 'AI agent' },
  { value: 'llm-app', label: 'LLM application' },
  { value: 'backend', label: 'Production backend' },
  { value: 'mvp', label: 'AI-native MVP' },
  { value: 'other', label: 'Something else' },
] as const;

const BUDGETS = [
  { value: 'under-5k', label: 'Under $5k' },
  { value: '5k-15k', label: '$5k – $15k' },
  { value: '15k-50k', label: '$15k – $50k' },
  { value: 'over-50k', label: 'Over $50k' },
  { value: 'not-sure', label: 'Not sure yet' },
] as const;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

type Status = 'idle' | 'sending' | 'sent' | 'error';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  // Set on mount, not during render: Date.now() is impure and must not
  // run in the render path.
  const mountedAt = useRef<number>(0);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const tokenRef = useRef<string>('');

  // Load the Turnstile script only on this page. It is the only
  // third-party script the CSP allows besides the analytics beacon.
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!SITE_KEY) return;
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    const onReady = () => {
      if (!turnstileRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => {
          tokenRef.current = token;
        },
        'expired-callback': () => {
          tokenRef.current = '';
        },
        theme: 'auto',
      });
    };
    if (existing) {
      onReady();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = onReady;
    document.head.appendChild(script);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      company: String(form.get('company') ?? '') || undefined,
      projectType: String(form.get('projectType') ?? ''),
      budget: String(form.get('budget') ?? ''),
      message: String(form.get('message') ?? ''),
      website: String(form.get('website') ?? ''), // honeypot
      elapsedMs: mountedAt.current ? Date.now() - mountedAt.current : 0,
      turnstileToken: tokenRef.current,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'Your message could not be sent. Please try again.');
        setStatus('error');
        window.turnstile?.reset(widgetId.current ?? undefined);
        tokenRef.current = '';
        return;
      }
      setStatus('sent');
    } catch {
      setError('Your message could not be sent. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="border-border bg-bg-subtle rounded-[var(--radius-card)] border p-8">
        <h2 className="text-h3 text-fg">Message sent</h2>
        <p className="text-body text-fg-muted mt-2">
          Thanks — we read everything and reply within two working days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-6">
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          className={inputClass}
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      <Field label="Company" htmlFor="company" optional>
        <input
          id="company"
          name="company"
          maxLength={100}
          autoComplete="organization"
          className={inputClass}
        />
      </Field>

      <Field label="What do you need built?" htmlFor="projectType">
        <select
          id="projectType"
          name="projectType"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Choose one
          </option>
          {PROJECT_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Budget" htmlFor="budget">
        <select id="budget" name="budget" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose one
          </option>
          {BUDGETS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="What are you trying to ship, and what is in the way?"
        htmlFor="message"
      >
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          className={cn(inputClass, 'h-auto resize-y py-3')}
        />
      </Field>

      {/* Honeypot: off-screen, not hidden, so bots that skip display:none
          still fill it. Never announced to assistive tech. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {SITE_KEY ? (
        <div ref={turnstileRef} />
      ) : (
        <p className="text-small text-fg-subtle">
          TODO: set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable spam protection.
        </p>
      )}

      {error ? (
        <p role="alert" className="text-small text-error">
          {error}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  'text-small h-10 w-full rounded-[var(--radius-button)] border border-border bg-bg-subtle px-3 text-fg placeholder:text-fg-subtle transition-colors duration-[var(--dur-instant)] hover:border-border-strong focus-visible:border-border-strong';

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-small text-fg">
        {label}
        {optional ? <span className="text-fg-subtle"> (optional)</span> : null}
      </label>
      {children}
    </div>
  );
}
