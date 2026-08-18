// Build step for Перший Крок — copies src/ → dist/ and stamps build metadata.
//
// "Know when this is being built": every page is stamped at build time with the
// timestamp, git commit, branch and Vercel environment that produced it, so a
// deployed page can always tell you which build you are looking at.
// Locally the same values come from `git`, or fall back to "local".

import { execSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

const git = (args) => {
  try {
    return execSync(`git ${args}`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
};

const env = process.env;
const builtAt = new Date();

// Vercel injects these during `vercel build`; git is the local fallback.
const commit = env.VERCEL_GIT_COMMIT_SHA || git('rev-parse HEAD') || '';
const branch = env.VERCEL_GIT_COMMIT_REF || git('rev-parse --abbrev-ref HEAD') || 'local';
const target = env.VERCEL_ENV || (env.CI ? 'ci' : 'local');
const dirty = !env.VERCEL_ENV && git('status --porcelain') !== '';

const buildInfo = {
  builtAt: builtAt.toISOString(),
  builtAtEpoch: builtAt.getTime(),
  env: target,
  branch,
  commit,
  commitShort: commit ? commit.slice(0, 7) : 'nogit',
  dirty,
  deploymentUrl: env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null,
  region: env.VERCEL_REGION || null,
  node: process.version,
};

// Compact human stamp shown in the page footer, e.g. "prod · 3f9a1c2 · 18 Aug 2026 14:03 UTC"
const fmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
});
const stamp = [
  target,
  buildInfo.commitShort + (dirty ? '+' : ''),
  `${fmt.format(builtAt).replace(',', '')} UTC`,
].join(' · ');

const tokens = {
  '{{BUILD_STAMP}}': stamp,
  '{{BUILD_TIME}}': buildInfo.builtAt,
  '{{BUILD_COMMIT}}': buildInfo.commitShort,
  '{{BUILD_COMMIT_FULL}}': commit || 'unknown',
  '{{BUILD_BRANCH}}': branch,
  '{{BUILD_ENV}}': target,
  '{{YEAR}}': String(builtAt.getUTCFullYear()),
};

const TEXT = new Set(['.html', '.css', '.js', '.json', '.svg', '.webmanifest', '.txt']);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

let stamped = 0;
for (const file of await walk(src)) {
  const rel = path.relative(src, file);
  const dest = path.join(dist, rel);
  await mkdir(path.dirname(dest), { recursive: true });

  if (!TEXT.has(path.extname(file))) {
    await cp(file, dest);
    continue;
  }
  let text = await readFile(file, 'utf8');
  const before = text;
  for (const [token, value] of Object.entries(tokens)) text = text.split(token).join(value);
  if (text !== before) stamped++;
  await writeFile(dest, text);
}

await writeFile(path.join(dist, 'build-info.json'), JSON.stringify(buildInfo, null, 2));

console.log(`built ${stamp}`);
console.log(`  ${stamped} file(s) stamped → ${path.relative(root, dist)}/`);
