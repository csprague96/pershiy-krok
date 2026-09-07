// Speech providers. Text-to-speech: ElevenLabs first, then Azure / Google as
// fallbacks — `synthesize()` walks whatever is configured, in that order, and
// reports which one answered. Speech-to-text: ElevenLabs Scribe.
//
// Everything is plain fetch on Uint8Arrays so the same code serves
// scripts/tts.mjs (pre-generation) and api/*.js (runtime).

export const EL_TTS_MODEL = 'eleven_multilingual_v2'; // Ukrainian-capable, stable
export const EL_STT_MODEL = 'scribe_v2';
export const EL_VOICE = 'JBFqnCBsd6RMkjVDRZzb'; // "George" premade — override with ELEVENLABS_VOICE_ID

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

async function fail(label, res) {
  let detail = '';
  try { detail = (await res.text()).slice(0, 300); } catch { /* no body */ }
  const err = new Error(`${label} ${res.status}${detail ? `: ${detail}` : ''}`);
  err.status = res.status;
  throw err;
}

export async function elevenTts(text, env) {
  const voice = env.ELEVENLABS_VOICE_ID || EL_VOICE;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: env.ELEVENLABS_TTS_MODEL || EL_TTS_MODEL,
        voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true, speed: 0.92 },
      }),
    },
  );
  if (!res.ok) await fail('ElevenLabs TTS', res);
  return new Uint8Array(await res.arrayBuffer());
}

export async function azureTts(text, env) {
  const voice = env.AZURE_TTS_VOICE || env.TTS_VOICE || 'uk-UA-OstapNeural';
  const ssml = `<speak version="1.0" xml:lang="uk-UA"><voice name="${voice}"><prosody rate="-10%">${xml(text)}</prosody></voice></speak>`;
  const res = await fetch(`https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'pershyi-krok-tts',
    },
    body: ssml,
  });
  if (!res.ok) await fail('Azure TTS', res);
  return new Uint8Array(await res.arrayBuffer());
}

export async function googleTts(text, env) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'uk-UA', name: env.GOOGLE_TTS_VOICE || env.TTS_VOICE || 'uk-UA-Wavenet-A' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
    }),
  });
  if (!res.ok) await fail('Google TTS', res);
  const b64 = (await res.json()).audioContent;
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// Configured providers, best first.
export function ttsProviders(env) {
  const out = [];
  if (env.ELEVENLABS_API_KEY) out.push({ name: 'elevenlabs', fn: elevenTts });
  if (env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION) out.push({ name: 'azure', fn: azureTts });
  if (env.GOOGLE_TTS_KEY) out.push({ name: 'google', fn: googleTts });
  return out;
}

// Try each provider in turn; resolve with the first audio, or throw with every
// error attached so the caller can log what happened along the way.
export async function synthesize(text, env, providers = ttsProviders(env)) {
  const errors = [];
  for (const p of providers) {
    try {
      return { audio: await p.fn(text, env), provider: p.name, errors };
    } catch (err) {
      errors.push(`${p.name}: ${err.message}`);
    }
  }
  const err = new Error(errors.length ? errors.join(' | ') : 'no TTS provider configured');
  err.errors = errors;
  throw err;
}

// ElevenLabs Scribe. `audio` is the recorded blob bytes; `mime` its type.
export async function elevenStt(audio, mime, env, model = env.ELEVENLABS_STT_MODEL || EL_STT_MODEL) {
  const form = new FormData();
  form.append('model_id', model);
  form.append('language_code', 'uk');
  form.append('tag_audio_events', 'false');
  form.append('file', new Blob([audio], { type: mime }), `speech.${(mime.split('/')[1] || 'webm').split(';')[0]}`);
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
    body: form,
  });
  if (!res.ok) {
    // If this account doesn't have the newer model yet, fall back to scribe_v1 once.
    if (model !== 'scribe_v1' && (res.status === 400 || res.status === 404 || res.status === 422)) {
      return elevenStt(audio, mime, env, 'scribe_v1');
    }
    await fail('ElevenLabs STT', res);
  }
  const data = await res.json();
  return { text: String(data.text || '').trim(), model, language: data.language_code, confidence: data.language_probability };
}
