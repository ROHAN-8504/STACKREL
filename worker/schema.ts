import { z } from 'zod';

/**
 * Contact form validation — SPEC.md § Security requirements, Contact form.
 *
 * `.strict()` rejects unknown fields outright rather than stripping them,
 * so a payload carrying anything we did not ask for is refused.
 */

export const BUDGETS = ['under-5k', '5k-15k', '15k-50k', 'over-50k', 'not-sure'] as const;

export const PROJECT_TYPES = ['ai-agent', 'llm-app', 'backend', 'mvp', 'other'] as const;

export const contactSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.email().max(254),
    company: z.string().trim().max(100).optional(),
    projectType: z.enum(PROJECT_TYPES),
    budget: z.enum(BUDGETS),
    message: z.string().trim().min(1, 'Message is required').max(5000),

    // Anti-spam. Neither is shown to a real visitor.
    //
    // Honeypot: a real submission leaves this empty. It is NOT constrained
    // to length 0 here on purpose — that would make a filled honeypot a
    // 400 validation error, which tells a bot the field is a trap. The
    // Worker checks it separately and answers 200 as though the message
    // were accepted.
    website: z.string().max(200).optional().default(''),
    // Milliseconds since the form mounted; a bot submits instantly.
    elapsedMs: z
      .number()
      .int()
      .nonnegative()
      .max(1000 * 60 * 60 * 24),

    turnstileToken: z.string().min(1).max(2048),
  })
  .strict();

export type ContactInput = z.infer<typeof contactSchema>;

/** Minimum time a human plausibly needs to fill the form. */
export const MIN_ELAPSED_MS = 3000;

/**
 * Environment contract. Validated when the Worker handles its first
 * request, so a missing secret fails loudly rather than silently sending
 * nothing. SPEC.md § Secrets and config.
 */
export const envSchema = z.object({
  TURNSTILE_SECRET: z.string().min(1, 'TURNSTILE_SECRET is not set'),
  CONTACT_TO: z.email(),
  CONTACT_FROM: z.email(),
  ALLOWED_ORIGIN: z.url(),
});
