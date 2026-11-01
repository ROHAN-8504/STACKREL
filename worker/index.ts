import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

import { safeAddress, sanitizeHeaderValue, isHeaderSafe } from './headers';
import { contactSchema, envSchema, MIN_ELAPSED_MS } from './schema';
import { json } from './security-headers';

/**
 * Contact Worker — SPEC.md Phase 5 and § Security requirements.
 *
 * Only /api/* reaches this code; everything else is served from the static
 * export by the asset handler (see wrangler.jsonc run_worker_first).
 *
 * Submissions are not stored (SPEC.md: "Don't store submissions in v1").
 * The only state kept is an opaque per-IP counter in KV for rate limiting.
 */

export interface Env {
  TURNSTILE_SECRET: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  ALLOWED_ORIGIN: string;
  RATE_LIMIT: KVNamespace;
  CONTACT_EMAIL: { send(message: EmailMessage): Promise<void> };
}

const MAX_BODY_BYTES = 10 * 1024; // 10 KB
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1 hour

/** One generic message for every rejection: never leak why. */
const GENERIC_ERROR = 'Your message could not be sent. Please try again.';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/contact') {
      return json({ error: 'Not found' }, 404);
    }

    try {
      return await handleContact(request, env);
    } catch (error) {
      // Log server-side; never return a stack trace to the client.
      console.error('[contact] unhandled', error);
      return json({ error: GENERIC_ERROR }, 500);
    }
  },
};

async function handleContact(request: Request, env: Env): Promise<Response> {
  // --- 1. method ---------------------------------------------------------
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // --- 2. origin ---------------------------------------------------------
  // Exact match only; a missing or foreign Origin is refused.
  //
  // Read straight off env rather than through the validated config, so this
  // runs BEFORE the environment is checked. A deployment missing a secret
  // must still reject a foreign origin with 403 rather than answering 500:
  // a config gap should not turn the cheapest rejection into a server
  // error, nor let unverified traffic reach the rate limiter untracked.
  const allowedOrigin = env.ALLOWED_ORIGIN;
  const origin = request.headers.get('origin');
  if (!allowedOrigin || origin !== allowedOrigin) {
    return json({ error: GENERIC_ERROR }, 403);
  }

  // --- 3. content type ---------------------------------------------------
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json({ error: GENERIC_ERROR }, 415);
  }

  // --- 4. size cap -------------------------------------------------------
  // Trust the declared length when present, but measure the real bytes too:
  // Content-Length can lie or be absent on a chunked body.
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json({ error: GENERIC_ERROR }, 413);
  }
  const raw = await request.arrayBuffer();
  if (raw.byteLength > MAX_BODY_BYTES) {
    return json({ error: GENERIC_ERROR }, 413);
  }

  // --- 5. environment ----------------------------------------------------
  // Everything below needs real configuration, so validate it here.
  const parsedEnv = envSchema.safeParse(env);
  if (!parsedEnv.success) {
    console.error('[contact] misconfigured environment', parsedEnv.error.issues);
    return json({ error: GENERIC_ERROR }, 500);
  }
  const config = parsedEnv.data;

  // --- 6. rate limit -----------------------------------------------------
  // Keyed on CF-Connecting-IP, which Cloudflare sets and a client cannot
  // forge through the edge.
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const limited = await consumeRateLimit(env, ip);
  if (limited) {
    return json({ error: 'Too many messages. Please try again later.' }, 429);
  }

  // --- 7. parse + validate ----------------------------------------------
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return json({ error: GENERIC_ERROR }, 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: GENERIC_ERROR }, 400);
  }
  const data = parsed.data;

  // --- 8. honeypot + dwell time -----------------------------------------
  if (data.website !== '') {
    return json({ ok: true }, 200); // silently accept and discard
  }
  if (data.elapsedMs < MIN_ELAPSED_MS) {
    return json({ error: GENERIC_ERROR }, 400);
  }

  // --- 9. Turnstile ------------------------------------------------------
  const human = await verifyTurnstile(config.TURNSTILE_SECRET, data.turnstileToken, ip);
  if (!human) {
    return json({ error: GENERIC_ERROR }, 403);
  }

  // --- 10. deliver -------------------------------------------------------
  const replyTo = safeAddress(data.email);
  if (!replyTo) {
    // The address passed Zod but not header-safety: refuse rather than
    // place it in a header.
    return json({ error: GENERIC_ERROR }, 400);
  }

  await sendEmail(env, config, data, replyTo);

  // SPEC.md § Analytics: Web Analytics has no custom events, so contact
  // intent is counted here instead. The counter is a bare per-day integer —
  // no IP, no email, nothing that identifies a person.
  await countSubmission(env);

  return json({ ok: true }, 200);
}

/** Opaque per-day success counter. Keys expire after 90 days. */
async function countSubmission(env: Env): Promise<void> {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const key = `contact-success:${day}`;
    const current = Number((await env.RATE_LIMIT.get(key)) ?? '0');
    await env.RATE_LIMIT.put(key, String(current + 1), {
      expirationTtl: 60 * 60 * 24 * 90,
    });
  } catch (error) {
    // Never fail a delivered message because a counter write failed.
    console.error('[contact] counter write failed', error);
  }
}

/** Fixed-window counter in KV. 5 per hour per IP. */
async function consumeRateLimit(env: Env, ip: string): Promise<boolean> {
  const key = `rl:${ip}`;
  const current = Number((await env.RATE_LIMIT.get(key)) ?? '0');
  if (current >= RATE_LIMIT_MAX) return true;
  await env.RATE_LIMIT.put(key, String(current + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return false;
}

async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string,
): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip !== 'unknown') body.append('remoteip', ip);

  // Fail closed. If siteverify is unreachable or misbehaving we treat the
  // request as unverified rather than letting the exception become a 500 —
  // an outage must not become an open door, and it must not look like a
  // server bug to the visitor either.
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error('[contact] turnstile verification unavailable', error);
    return false;
  }
}

async function sendEmail(
  env: Env,
  config: { CONTACT_FROM: string; CONTACT_TO: string },
  data: {
    name: string;
    email: string;
    company?: string | undefined;
    projectType: string;
    budget: string;
    message: string;
  },
  replyTo: string,
): Promise<void> {
  // Every value that lands in a header is sanitised first; the body is
  // plain text, so newlines there are harmless.
  const name = sanitizeHeaderValue(data.name, 100);
  const subject = sanitizeHeaderValue(`New project enquiry — ${name || 'unnamed'}`, 180);

  // Fixed sender and fixed destination: both come from config, never from
  // the submission.
  const from = config.CONTACT_FROM;
  const to = config.CONTACT_TO;

  for (const value of [from, to, replyTo, subject, name]) {
    if (!isHeaderSafe(value)) throw new Error('unsafe header value');
  }

  const msg = createMimeMessage();
  msg.setSender({ name: 'Stackrel site', addr: from });
  msg.setRecipient(to);
  msg.setSubject(subject);
  msg.setHeader('Reply-To', replyTo);
  msg.addMessage({
    contentType: 'text/plain',
    data: [
      `Name:         ${data.name}`,
      `Email:        ${data.email}`,
      `Company:      ${data.company ?? '—'}`,
      `Project type: ${data.projectType}`,
      `Budget:       ${data.budget}`,
      '',
      'Message:',
      data.message,
    ].join('\n'),
  });

  const message = new EmailMessage(from, to, msg.asRaw());
  await env.CONTACT_EMAIL.send(message);
}
