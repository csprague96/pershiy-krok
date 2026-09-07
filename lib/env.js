// Load a flat KEY=VALUE .env file into process.env (local scripts + dev server only;
// on Vercel the variables come from the project settings). No dependency needed.
import { existsSync, readFileSync } from 'node:fs';

export function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
