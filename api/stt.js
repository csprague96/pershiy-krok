// Speech-to-text for the "say it out loud" steps (ElevenLabs Scribe).
//   GET  /api/stt                       → { ok, provider }  (is it available to this browser?)
//   POST /api/stt  body: recorded audio  → { text, model }
//        Content-Type: the recording's MIME type (audio/webm, audio/mp4, audio/ogg, audio/wav)
//
// Scoring against the target phrase happens in the browser (src/app.js), where
// the target is known; the server just transcribes. On any failure the client
// falls back to the browser's own speech recognition.
import { isAuthed } from '../lib/session.js';
import { elevenStt } from '../lib/speech.js';

const MAX_BYTES = 3 * 1024 * 1024; // ~10 s of opus is well under 200 KB; this is a hard cap

export default {
  async fetch(request) {
    const env = process.env;
    if (!(await isAuthed(request, env))) return Response.json({ error: 'locked' }, { status: 401 });
    const configured = Boolean(env.ELEVENLABS_API_KEY);

    if (request.method === 'GET') {
      return Response.json({ ok: configured, provider: configured ? 'elevenlabs' : null }, { headers: { 'cache-control': 'no-store' } });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (!configured) return Response.json({ error: 'no STT provider configured' }, { status: 503 });

    const mime = (request.headers.get('content-type') || '').split(';')[0].trim();
    if (!/^audio\/(webm|mp4|ogg|wav|x-wav|mpeg|aac|m4a)$/.test(mime)) {
      return Response.json({ error: `unsupported audio type ${mime || '(none)'}` }, { status: 415 });
    }
    const audio = new Uint8Array(await request.arrayBuffer());
    if (audio.byteLength < 1000) return Response.json({ error: 'recording too short' }, { status: 400 });
    if (audio.byteLength > MAX_BYTES) return Response.json({ error: 'recording too large' }, { status: 413 });

    try {
      const out = await elevenStt(audio, mime, env);
      return Response.json({ text: out.text, model: out.model, provider: 'elevenlabs' }, { headers: { 'cache-control': 'no-store' } });
    } catch (err) {
      console.error(`stt: ${err.message}`);
      return Response.json({ error: 'transcription failed', detail: err.message }, { status: 502 });
    }
  },
};
