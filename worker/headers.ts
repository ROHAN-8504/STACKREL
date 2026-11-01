/**
 * Header hygiene for outgoing email.
 *
 * SPEC.md § Contact form: "put the visitor's address only in Reply-To
 * after validation and after stripping CR/LF from every header value".
 *
 * A CR or LF inside a header value lets an attacker start a new header —
 * or, after a blank line, a new body — so a crafted name or email could
 * add Bcc recipients or replace the message. Everything that reaches a
 * header goes through sanitizeHeaderValue first.
 */

/** Strips CR, LF, NUL and other control characters, then collapses space. */
export function sanitizeHeaderValue(input: string, maxLength = 255): string {
  return (
    input
      // eslint-disable-next-line no-control-regex -- stripping control chars is the point
      .replace(/[\r\n\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength)
  );
}

/**
 * True when a value is safe to place in a header as-is. Used by tests and
 * as a last-ditch assertion before send.
 */
export function isHeaderSafe(value: string): boolean {
  // eslint-disable-next-line no-control-regex
  return !/[\r\n\u0000]/.test(value);
}

/**
 * An email address that is safe to use in a header. Returns null when the
 * address does not survive sanitising unchanged, which means it contained
 * something it should not have.
 */
export function safeAddress(email: string): string | null {
  const cleaned = sanitizeHeaderValue(email, 254);
  if (cleaned !== email.trim()) return null;
  if (!isHeaderSafe(cleaned)) return null;
  // Deliberately strict: one @, no spaces, no commas or semicolons that
  // could introduce a second recipient.
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(cleaned)) return null;
  return cleaned;
}
