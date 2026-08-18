// Pre-generate audio for every Ukrainian string the UI can play.
//
// Run manually (never part of the Vercel build):   npm run tts
//
// Reads src/data.js, synthesizes each missing phrase to src/audio/<hash>.mp3,
// and writes src/audio/manifest.json mapping text → filename. Files that
// already exist are skipped, so re-runs are free — and a human recording
// dropped in at the same filename simply wins and is never overwritten.
//
// Credentials come from .env (gitignored) or the environment:
//   AZURE_SPEECH_KEY + AZURE_SPEECH_REGION   → Azure (uk-UA-OstapNeural)
//   GOOGLE_TTS_KEY                           → Google Cloud TTS (uk-UA-Wavenet-A)
// Optional: TTS_VOICE to override the default voice name for either provider.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = path.join(root, 'src', 'audio');

// ── env (.env is a flat KEY=VALUE file; no dependency needed) ──
for (const file of ['.env']) {
  const p = path.join(root, file);
  if (!existsSync(p)) continue;
  for (const line of (await readFile(p, 'utf8')).split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, GOOGLE_TTS_KEY, TTS_VOICE } = process.env;

// ── collect every string the UI passes to the audio player ──
const sandbox = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'src', 'data.js'), 'utf8'), sandbox);
const { TERMS, SCENARIOS } = sandbox.window.PK;

const texts = new Set();
for (const t of TERMS) texts.add(t.uk);
for (const scen of SCENARIOS) {
  for (const l of scen.lines) {
    // УК lines play the line itself; EN lines play the Ukrainian in `tr`
    // (mirrors the data-say logic in app.js).
    texts.add(l.lang === 'УК' ? l.uk : l.tr.replace(/\s*\[.*\]$/, ''));
  }
}

// ── providers ──
async function azure(text) {
  const voice = TTS_VOICE || 'uk-UA-OstapNeural';
  const ssml = `<speak version="1.0" xml:lang="uk-UA"><voice name="${voice}"><prosody rate="-10%">${text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')}</prosody></voice></speak>`;
  const res = await fetch(`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'pershyi-krok-tts',
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Azure ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function google(text) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'uk-UA', name: TTS_VOICE || 'uk-UA-Wavenet-A' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
    }),
  });
  if (!res.ok) throw new Error(`Google ${res.status}: ${await res.text()}`);
  return Buffer.from((await res.json()).audioContent, 'base64');
}

const provider =
  AZURE_SPEECH_KEY && AZURE_SPEECH_REGION ? { name: 'azure', fn: azure } :
  GOOGLE_TTS_KEY ? { name: 'google', fn: google } : null;

if (!provider) {
  console.error(
    'No TTS credentials found. Put one of these in .env:\n' +
    '  AZURE_SPEECH_KEY=… and AZURE_SPEECH_REGION=…   (portal.azure.com → Speech service)\n' +
    '  GOOGLE_TTS_KEY=…                               (console.cloud.google.com → Cloud TTS API key)',
  );
  process.exit(1);
}

// ── synthesize whatever is missing ──
await mkdir(audioDir, { recursive: true });
const manifestPath = path.join(audioDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};

const fname = (text) => `${createHash('sha1').update(text).digest('hex').slice(0, 12)}.mp3`;
let made = 0, kept = 0, chars = 0, failed = 0;

for (const text of [...texts].sort()) {
  const file = fname(text);
  manifest[text] = file;
  if (existsSync(path.join(audioDir, file))) { kept++; continue; }
  try {
    await writeFile(path.join(audioDir, file), await provider.fn(text));
    made++;
    chars += text.length;
    process.stdout.write(`  + ${file}  ${text}\n`);
    await new Promise((r) => setTimeout(r, 150)); // stay polite to the API
  } catch (err) {
    failed++;
    delete manifest[text];
    console.error(`  ! ${text} — ${err.message}`);
  }
}

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `\n${provider.name}: ${made} synthesized (${chars} chars), ${kept} already on disk, ${failed} failed — ` +
  `${Object.keys(manifest).length} phrases in manifest`,
);
