// Every Ukrainian string the UI can play. Shared by scripts/tts.mjs (pre-
// generation) and api/tts.js (the runtime allow-list: the API only synthesizes
// phrases that exist in the site's content, so a stolen URL can't run up the
// bill on arbitrary text).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export const DATA_FILE = new URL('../src/data.js', import.meta.url);

export function loadData(file = DATA_FILE) {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(file, 'utf8'), sandbox);
  return sandbox.window.PK;
}

const CYRILLIC = /[Ѐ-ӿ]/;

export function collectPhrases(PK) {
  const texts = new Set();
  for (const t of PK.TERMS) {
    texts.add(t.uk);
    if (t.example?.uk) texts.add(t.example.uk);
  }
  for (const journey of PK.SCENARIOS) {
    for (const scene of journey.scenes) {
      for (const step of scene.steps) {
        if (step.uk && (step.type === 'line' || step.type === 'speak' || step.type === 'translate')) texts.add(step.uk);
        // Correct choice answers are played back; only Cyrillic labels are phrases.
        if (step.type === 'choice') {
          for (const o of step.options) if (o.right && CYRILLIC.test(o.label)) texts.add(o.label);
        }
      }
    }
  }
  return texts;
}
