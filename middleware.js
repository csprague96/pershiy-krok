// Access gate (Vercel Routing Middleware, Edge runtime).
//
// The course and scenario pages, and the speech APIs behind them, are locked
// behind a shared access code so the paid ElevenLabs key can't be hammered by
// anyone who finds the URL. The homepage and glossary stay public (they only
// use pre-generated audio). Edit `matcher` to change what is gated.
//
// With no SITE_PASSWORD set the gate is open — see lib/session.js.
import { isAuthed } from './lib/session.js';

export const config = {
  matcher: ['/course', '/course.html', '/scenario', '/scenario.html', '/api/tts', '/api/stt'],
};

export default async function middleware(request) {
  if (await isAuthed(request, process.env)) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return Response.json({ error: 'locked', login: '/login' }, { status: 401 });
  }
  const login = new URL('/login', url);
  login.searchParams.set('next', url.pathname + url.search);
  return Response.redirect(login, 302);
}
