// On-demand pronunciation audio for phrases that have no pre-generated file.
//   GET /api/tts?text=<ukrainian phrase>  → audio/mpeg
//
// Guard rails: the caller must be through the access gate (middleware checks,
// and so does this — defence in depth), and unless TTS_ALLOW_ANY=1 the text
// must be a phrase that exists in src/data.js. Responses are CDN-cached for a
// year per exact text, so each phrase is synthesized once per deploy at most.
import { isAuthed } from '../lib/session.js';
import { synthesize, ttsProviders } from '../lib/speech.js';
import { collectPhrases, loadData } from '../lib/phrases.js';

const MAX_CHARS = 200;
let corpus = null;
const allowed = (text, env) => {
  if (env.TTS_ALLOW_ANY === '1') return true;
  try { corpus ||= collectPhrases(loadData()); } catch (err) { console.error('tts: cannot load corpus', err); return false; }
  return corpus.has(text);
};

export default {
  async fetch(request) {
    const env = process.env;
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
    if (!(await isAuthed(request, env))) return Response.json({ error: 'locked' }, { status: 401 });

    const text = (new URL(request.url).searchParams.get('text') || '').trim();
    if (!text || text.length > MAX_CHARS) return Response.json({ error: 'text missing or too long' }, { status: 400 });
    if (!allowed(text, env)) return Response.json({ error: 'unknown phrase' }, { status: 403 });
    const providers = ttsProviders(env);
    if (!providers.length) return Response.json({ error: 'no TTS provider configured' }, { status: 503 });

    try {
      const { audio, provider, errors } = await synthesize(text, env, providers);
      if (errors.length) console.warn(`tts: fell back to ${provider} for «${text}» — ${errors.join(' | ')}`);
      return new Response(audio, {
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': String(audio.byteLength),
          'cache-control': 'public, max-age=86400, s-maxage=31536000, immutable',
          'x-tts-provider': provider,
        },
      });
    } catch (err) {
      console.error(`tts: all providers failed for «${text}» — ${err.message}`);
      return Response.json({ error: 'synthesis failed', detail: err.errors || err.message }, { status: 502 });
    }
  },
};
