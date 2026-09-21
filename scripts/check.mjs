// Content lint for src/data.js — nothing else validates it.
//
//   npm run check                 everything, including audio coverage
//   npm run check -- --no-audio   skip the manifest checks (before `npm run tts`)
//
// Exits 1 on any error. Warnings never fail the run.
import { readFileSync } from 'node:fs';
import { loadData, collectPhrases } from '../lib/phrases.js';

const noAudio = process.argv.includes('--no-audio');
const PK = loadData();
const errors = [];
const warns = [];
const LANGS = ['en', 'es', 'pt'];
const full = (o, keys) => keys.every((k) => typeof o?.[k] === 'string' && o[k].trim());

// Terms: every slot filled, known section, no duplicate headword.
const sections = new Set(PK.SECTIONS.map((s) => s.id));
const seen = new Map();
for (const t of PK.TERMS) {
  if (!full(t, ['uk', 'tr', ...LANGS])) errors.push(`term «${t.uk}»: missing uk/tr/en/es/pt`);
  if (!sections.has(t.sec)) errors.push(`term «${t.uk}»: unknown section "${t.sec}"`);
  if (t.example && !full(t.example, ['uk', ...LANGS])) errors.push(`term «${t.uk}»: partial example`);
  if (seen.has(t.uk)) errors.push(`duplicate term «${t.uk}» (§${seen.get(t.uk)} and §${t.sec})`);
  seen.set(t.uk, t.sec);
}
for (const s of PK.SECTIONS) {
  if (!full(s, ['uk', ...LANGS])) errors.push(`section ${s.id}: missing a name`);
  if (!PK.TERMS.some((t) => t.sec === s.id)) errors.push(`section ${s.id}: no terms`);
}

// Tracks and journeys.
const tracks = new Set(PK.TRACKS.map((t) => t.no));
const isSpoken = (step) => step.type === 'speak' || (step.type === 'line' && step.lang === 'EN');
const ids = new Set();
for (const j of PK.SCENARIOS) {
  const at = `journey ${j.id}`;
  if (ids.has(j.id)) errors.push(`${at}: duplicate id`);
  ids.add(j.id);
  if (!tracks.has(j.track)) errors.push(`${at}: unknown track "${j.track}"`);
  if (!full(j, ['uk', ...LANGS])) errors.push(`${at}: missing a title`);
  for (const k of j.keyTerms || []) if (!seen.has(k)) errors.push(`${at}: keyTerm «${k}» is not a glossary term`);
  const sceneIds = new Set();
  for (const sc of j.scenes) {
    const where = `${at} / ${sc.id}`;
    if (sceneIds.has(sc.id)) errors.push(`${where}: duplicate scene id`);
    sceneIds.add(sc.id);
    if (!full(sc, ['uk', ...LANGS])) errors.push(`${where}: missing a title`);
    if (sc.steps.filter(isSpoken).length < 2) warns.push(`${where}: fewer than 2 spoken steps`);
    sc.steps.forEach((step, i) => {
      const s = `${where} #${i + 1} (${step.type})`;
      switch (step.type) {
        case 'line':
          if (step.lang !== 'УК' && step.lang !== 'EN') errors.push(`${s}: lang must be УК or EN`);
          // falls through
        case 'speak':
          if (!full(step, ['uk', 'tr', ...LANGS])) errors.push(`${s}: missing uk/tr/en/es/pt`);
          // No accepted-variants field: long targets are hard to pass at 70 %.
          if (isSpoken(step) && step.uk.split(/\s+/).length > 7) warns.push(`${s}: spoken target over 7 words`);
          break;
        case 'choice':
          if (!full(step.q, LANGS)) errors.push(`${s}: question missing a language`);
          if (step.options.filter((o) => o.right).length !== 1) errors.push(`${s}: needs exactly one right option`);
          break;
        case 'translate':
          if (!full(step, ['uk', 'tr']) || !full(step.model, LANGS)) errors.push(`${s}: missing uk/tr/model`);
          for (const l of LANGS) if (!Array.isArray(step.keywords?.[l]) || !step.keywords[l].length) errors.push(`${s}: no ${l} keywords`);
          break;
        case 'info':
          if (!full(step.title, LANGS) || !full(step.body, LANGS)) errors.push(`${s}: title/body missing a language`);
          break;
        default:
          errors.push(`${s}: unknown step type`);
      }
    });
  }
}
for (const t of PK.TRACKS) if (!PK.SCENARIOS.some((j) => j.track === t.no)) errors.push(`track ${t.no}: no journey`);

// Audio: every playable phrase has a file, made by ElevenLabs or a human.
const phrases = collectPhrases(PK);
if (!noAudio) {
  const manifest = JSON.parse(readFileSync(new URL('../src/audio/manifest.json', import.meta.url), 'utf8'));
  for (const text of phrases) {
    const entry = manifest[text];
    if (!entry) errors.push(`audio missing: «${text}»`);
    else if (typeof entry === 'string' || !['elevenlabs', 'human'].includes(entry.provider)) {
      errors.push(`audio by ${entry.provider || 'unknown provider'}: «${text}» — re-run npm run tts -- --upgrade`);
    }
  }
}

const scenes = PK.SCENARIOS.reduce((n, j) => n + j.scenes.length, 0);
console.log(`${PK.TERMS.length} terms / ${PK.SECTIONS.length} sections · ${PK.TRACKS.length} tracks / ${PK.SCENARIOS.length} journeys / ${scenes} scenes · ${phrases.size} phrases`);
for (const w of warns) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(errors.length ? `${errors.length} error(s)` : `ok${noAudio ? ' (audio not checked)' : ''}`);
process.exit(errors.length ? 1 : 0);
