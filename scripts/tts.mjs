// Pre-generate audio for every Ukrainian string the UI can play.
//
//   npm run tts                 synthesize whatever is missing
//   npm run tts -- --upgrade    also re-synthesize files made by a lesser provider
//                               (e.g. Google → ElevenLabs once a key is added)
//   npm run tts -- --dry        list what would be done, call nothing
//
// Reads src/data.js (via lib/phrases.js), writes src/audio/<hash>.mp3 and
// src/audio/manifest.json mapping text → { file, provider, at }. Never part of
// the Vercel build; generated audio is committed and served statically, and
// api/tts.js covers anything that slips through at runtime.
//
// Providers come from .env / the environment, best first (see lib/speech.js):
//   ELEVENLABS_API_KEY [+ ELEVENLABS_VOICE_ID]   → ElevenLabs (eleven_multilingual_v2)
//   AZURE_SPEECH_KEY + AZURE_SPEECH_REGION       → Azure (uk-UA-OstapNeural)
//   GOOGLE_TTS_KEY                               → Google Cloud TTS (uk-UA-Wavenet-A)
// If the best provider fails on a phrase, the next one is tried for that phrase.
//
// Human recordings: drop the MP3 in at the manifest's filename and set that
// entry's provider to "human" — it is then never touched, even by --upgrade.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../lib/env.js';
import { collectPhrases, loadData } from '../lib/phrases.js';
import { synthesize, ttsProviders } from '../lib/speech.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = path.join(root, 'src', 'audio');
loadEnv(path.join(root, '.env'));

const args = new Set(process.argv.slice(2));
const upgrade = args.has('--upgrade');
const dry = args.has('--dry');

const providers = ttsProviders(process.env);
if (!providers.length) {
  console.error(
    'No TTS credentials found. Put one of these in .env:\n' +
    '  ELEVENLABS_API_KEY=…                          (elevenlabs.io → profile → API keys)\n' +
    '  AZURE_SPEECH_KEY=… and AZURE_SPEECH_REGION=…  (portal.azure.com → Speech service)\n' +
    '  GOOGLE_TTS_KEY=…                              (console.cloud.google.com → Cloud TTS API key)',
  );
  process.exit(1);
}
const best = providers[0].name;
console.log(`providers: ${providers.map((p) => p.name).join(' → ')}${upgrade ? ' (upgrade mode)' : ''}${dry ? ' (dry run)' : ''}`);

const texts = collectPhrases(loadData());

await mkdir(audioDir, { recursive: true });
const manifestPath = path.join(audioDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};
// Normalize v1 entries (bare filename) to v2 objects.
for (const [k, v] of Object.entries(manifest)) if (typeof v === 'string') manifest[k] = { file: v, provider: 'unknown' };

const fname = (text) => `${createHash('sha1').update(text).digest('hex').slice(0, 12)}.mp3`;
const stats = { made: 0, kept: 0, chars: 0, failed: 0, fellBack: 0 };

for (const text of [...texts].sort()) {
  const file = fname(text);
  const entry = manifest[text] || { file, provider: 'unknown' };
  const onDisk = existsSync(path.join(audioDir, entry.file));
  const stale = upgrade && entry.provider !== best && entry.provider !== 'human';
  if (onDisk && !stale) { manifest[text] = entry; stats.kept++; continue; }

  if (dry) {
    console.log(`  ${onDisk ? '↑' : '+'} ${file}  ${text}${onDisk ? `  (${entry.provider} → ${best})` : ''}`);
    manifest[text] = entry;
    stats.made++;
    continue;
  }
  try {
    const { audio, provider, errors } = await synthesize(text, process.env, providers);
    await writeFile(path.join(audioDir, file), audio);
    manifest[text] = { file, provider, at: new Date().toISOString().slice(0, 10) };
    stats.made++;
    stats.chars += text.length;
    if (errors.length) { stats.fellBack++; console.warn(`  ~ ${file}  ${text}  (${provider}; ${errors.join(' | ')})`); }
    else process.stdout.write(`  ${onDisk ? '↑' : '+'} ${file}  ${text}\n`);
    await new Promise((r) => setTimeout(r, 150)); // stay polite to the APIs
  } catch (err) {
    stats.failed++;
    if (!onDisk) delete manifest[text];
    console.error(`  ! ${text} — ${err.message}`);
  }
}

// Drop manifest entries for phrases that left the content (files stay on disk).
for (const k of Object.keys(manifest)) if (!texts.has(k)) delete manifest[k];

if (!dry) await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `\n${best}: ${stats.made} synthesized (${stats.chars} chars${stats.fellBack ? `, ${stats.fellBack} via fallback` : ''}), ` +
  `${stats.kept} already on disk, ${stats.failed} failed — ${Object.keys(manifest).length} phrases in manifest`,
);
