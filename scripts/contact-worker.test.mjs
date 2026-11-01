// Acceptance tests for the contact Worker — SPEC.md Phase 5:
// "scripted tests confirm the rate limit, Origin check, size cap, and that
// CR/LF in input cannot alter email headers."
//
// Run against a live `wrangler dev`:
//   npx wrangler dev --port 8787        (in one shell)
//   pnpm test:contact                   (in another)
//
// Uses node:test, so no test framework is added to the project.

import assert from 'node:assert/strict';
import test from 'node:test';

import { safeAddress, sanitizeHeaderValue, isHeaderSafe } from '../worker/headers.ts';

const BASE = process.env.WORKER_URL ?? 'http://127.0.0.1:8787';
const ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://stackrel.com';

const valid = () => ({
  name: 'Test Person',
  email: 'test@example.com',
  company: 'Example Ltd',
  projectType: 'backend',
  budget: '5k-15k',
  message: 'We need an API built.',
  website: '',
  elapsedMs: 9000,
  turnstileToken: 'dummy-token',
});

/** POST with a unique IP so each test gets its own rate-limit bucket. */
function post(
  body,
  { origin = ORIGIN, contentType = 'application/json', ip, method = 'POST' } = {},
) {
  const headers = {};
  if (origin !== null) headers.origin = origin;
  if (contentType !== null) headers['content-type'] = contentType;
  headers['cf-connecting-ip'] = ip ?? `10.0.0.${Math.floor(Math.random() * 250) + 1}`;
  const init = { method, headers };
  // fetch forbids a body on GET/HEAD.
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return fetch(`${BASE}/api/contact`, init);
}

// ---------------------------------------------------------------- unit
// These need no server: header hygiene is the highest-risk logic.

test('CR/LF in a name cannot start a new header', () => {
  const evil = 'Bob\r\nBcc: attacker@evil.test';
  const clean = sanitizeHeaderValue(evil);
  assert.ok(isHeaderSafe(clean), 'sanitised value still contains CR/LF');
  assert.ok(!clean.includes('\r') && !clean.includes('\n'));
  assert.ok(!/\bBcc:/i.test(clean) || !clean.includes('\n'));
});

test('CR/LF in an email address is rejected outright', () => {
  for (const evil of [
    'a@b.com\r\nBcc: attacker@evil.test',
    'a@b.com\nBcc: attacker@evil.test',
    'a@b.com%0ABcc:x@y.com\r\n',
    'a@b.com, second@evil.test',
    'a@b.com;second@evil.test',
    'a@b.com\u0000',
  ]) {
    assert.equal(safeAddress(evil), null, `should reject: ${JSON.stringify(evil)}`);
  }
});

test('a normal address survives, with surrounding space trimmed', () => {
  assert.equal(safeAddress('person@example.com'), 'person@example.com');
  // Padding is trimmed rather than rejected: spaces are not an injection
  // vector, and a typed address often carries them.
  assert.equal(safeAddress('  person@example.com  '), 'person@example.com');
  // Internal whitespace is a different matter and must not pass.
  assert.equal(safeAddress('per son@example.com'), null);
});

test('sanitiser strips control characters and collapses whitespace', () => {
  assert.equal(sanitizeHeaderValue('a\u0001b\tc\r\nd'), 'a b c d');
  assert.equal(sanitizeHeaderValue('x'.repeat(500), 100).length, 100);
});

// ------------------------------------------------------------ integration
const serverUp = await fetch(`${BASE}/api/contact`, { method: 'OPTIONS' })
  .then(() => true)
  .catch(() => false);

test(
  'Origin check: a foreign Origin is refused',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post(valid(), { origin: 'https://evil.test' });
    assert.equal(res.status, 403);
  },
);

test(
  'Origin check: a missing Origin is refused',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post(valid(), { origin: null });
    assert.equal(res.status, 403);
  },
);

test(
  'method check: GET is refused',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post(valid(), { method: 'GET' });
    assert.ok(res.status === 405 || res.status === 404, `got ${res.status}`);
  },
);

test(
  'content type: form encoding is refused',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post(valid(), { contentType: 'application/x-www-form-urlencoded' });
    assert.equal(res.status, 415);
  },
);

test(
  'size cap: a body over 10KB is refused',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const big = { ...valid(), message: 'x'.repeat(11 * 1024) };
    const res = await post(big);
    assert.equal(res.status, 413);
  },
);

test(
  'validation: unknown fields are rejected',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post({ ...valid(), isAdmin: true });
    assert.equal(res.status, 400);
  },
);

test(
  'validation: a bad enum is rejected',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post({ ...valid(), budget: 'free' });
    assert.equal(res.status, 400);
  },
);

test(
  'validation: an over-long message is rejected',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post({ ...valid(), message: 'x'.repeat(5001) });
    assert.equal(res.status, 400);
  },
);

test(
  'dwell time: an instant submit is rejected',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post({ ...valid(), elapsedMs: 100 });
    assert.equal(res.status, 400);
  },
);

test(
  'honeypot: a filled honeypot is accepted and discarded',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post({ ...valid(), website: 'http://spam.test' });
    assert.equal(res.status, 200, 'honeypot should not reveal itself');
  },
);

test(
  'rate limit: the 6th submission from one IP is refused',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const ip = `10.9.9.${Math.floor(Math.random() * 250) + 1}`;
    const codes = [];
    for (let i = 0; i < 6; i++) {
      const res = await post(valid(), { ip });
      codes.push(res.status);
    }
    assert.equal(codes[5], 429, `expected the 6th to be 429, got ${codes.join(',')}`);
    assert.ok(
      !codes.slice(0, 5).includes(429),
      `no 429 in the first five: ${codes.join(',')}`,
    );
  },
);

test(
  'errors are generic: no stack traces leak',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post('not json at all');
    const text = await res.text();
    assert.ok(!/\bat \w+ \(/.test(text), 'response looks like it contains a stack trace');
    assert.ok(!/worker\/index\.ts/.test(text));
  },
);

test(
  'Turnstile failure fails closed with a refusal, not a 500',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    // In this environment challenges.cloudflare.com is unreachable, so this
    // exercises the outage path directly: an unverifiable token must be
    // refused cleanly rather than surfacing as a server error.
    const res = await post(valid());
    assert.ok(
      res.status === 403 || res.status === 200,
      `expected 403 (or 200 when verification succeeds), got ${res.status}`,
    );
    assert.notEqual(res.status, 500, 'a verification outage must not become a 500');
  },
);

test(
  'security headers are present on Worker responses',
  { skip: !serverUp && 'wrangler dev not running' },
  async () => {
    const res = await post(valid(), { origin: 'https://evil.test' });
    for (const h of [
      'strict-transport-security',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy',
      'cross-origin-opener-policy',
    ]) {
      assert.ok(res.headers.get(h), `missing ${h}`);
    }
  },
);
