// Access gate: a shared access code (SITE_PASSWORD) exchanged for a signed,
// expiring cookie. Runs in both the Edge middleware and Node functions, so it
// only uses WebCrypto — no node:crypto.
//
// Token format: `v1.<expiry ms>.<base64url HMAC-SHA256>`. The HMAC key is
// SESSION_SECRET, or derived from SITE_PASSWORD when no secret is set, so one
// variable is enough to turn the gate on. Per-user logins can slot in here
// later: mint a token per user instead of per shared code.

export const COOKIE = 'pk-access';
const DAYS = 30;
const enc = new TextEncoder();

const b64u = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const hmacKey = (secret) =>
  crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

// Constant-time-ish string compare (no early exit on mismatch).
export function safeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const gateEnabled = (env) => Boolean(env.SITE_PASSWORD);
export const secretFor = (env) => env.SESSION_SECRET || (env.SITE_PASSWORD ? `pk-session:${env.SITE_PASSWORD}` : '');

export async function mintToken(secret, days = DAYS) {
  const exp = Date.now() + days * 864e5;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(`v1.${exp}`));
  return `v1.${exp}.${b64u(sig)}`;
}

export async function verifyToken(secret, token) {
  if (!secret || !token) return false;
  const [v, exp, sig] = String(token).split('.');
  if (v !== 'v1' || !exp || !sig || !(Number(exp) > Date.now())) return false;
  const expected = b64u(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(`v1.${exp}`)));
  return safeEqual(expected, sig);
}

export function readCookie(header, name) {
  for (const part of String(header || '').split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

export function cookieHeader(token, { secure = true, clear = false } = {}) {
  const bits = [
    `${COOKIE}=${clear ? '' : encodeURIComponent(token)}`,
    'Path=/', 'HttpOnly', 'SameSite=Lax',
    `Max-Age=${clear ? 0 : DAYS * 86400}`,
  ];
  if (secure) bits.push('Secure');
  return bits.join('; ');
}

// True when the request may use gated pages/APIs. With no SITE_PASSWORD the
// gate is simply open (local dev, first deploy before env vars are set).
export async function isAuthed(request, env) {
  if (!gateEnabled(env)) return true;
  return verifyToken(secretFor(env), readCookie(request.headers.get('cookie'), COOKIE));
}
