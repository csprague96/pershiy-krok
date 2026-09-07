// Shared access code → signed cookie.
//   GET    → { gate, authed }      (is the gate on, and is this browser in?)
//   POST   { code } → 204 + cookie, 401 on a wrong code, 429 after repeated misses
//   DELETE → clears the cookie
import { cookieHeader, gateEnabled, isAuthed, mintToken, safeEqual, secretFor } from '../lib/session.js';

// Best-effort brute-force damping (per warm instance; resets on cold start).
const misses = new Map();
const WINDOW = 10 * 60 * 1000, LIMIT = 8;
const ipOf = (req) => (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim();

export default {
  async fetch(request) {
    const env = process.env;
    const secure = new URL(request.url).protocol === 'https:';

    if (request.method === 'GET') {
      return Response.json({ gate: gateEnabled(env), authed: await isAuthed(request, env) }, { headers: { 'cache-control': 'no-store' } });
    }
    if (request.method === 'DELETE') {
      return new Response(null, { status: 204, headers: { 'set-cookie': cookieHeader('', { secure, clear: true }) } });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (!gateEnabled(env)) return Response.json({ error: 'gate is off' }, { status: 400 });

    const ip = ipOf(request);
    const rec = misses.get(ip);
    if (rec && rec.n >= LIMIT && Date.now() - rec.t < WINDOW) {
      return Response.json({ error: 'too many attempts — wait a few minutes' }, { status: 429 });
    }

    let code = '';
    try { code = String((await request.json()).code || ''); } catch { /* not JSON */ }
    if (!code || !safeEqual(code.trim(), env.SITE_PASSWORD)) {
      const cur = rec && Date.now() - rec.t < WINDOW ? rec : { n: 0, t: Date.now() };
      misses.set(ip, { n: cur.n + 1, t: cur.t });
      await new Promise((r) => setTimeout(r, 400));
      return Response.json({ error: 'wrong code' }, { status: 401 });
    }
    misses.delete(ip);
    const token = await mintToken(secretFor(env));
    return new Response(null, { status: 204, headers: { 'set-cookie': cookieHeader(token, { secure }) } });
  },
};
