// Local preview of dist/ that behaves like the Vercel deployment:
//   • cleanUrls (/glossary → glossary.html)
//   • the access-gate middleware (middleware.js) on the same paths
//   • api/*.js mounted at /api/* (Web-standard fetch handlers)
// Credentials and SITE_PASSWORD are read from .env.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from '../lib/env.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT) || 3000;
loadEnv(path.join(root, '.env'));

const mw = await import(pathToFileURL(path.join(root, 'middleware.js')).href);
const matchers = [].concat(mw.config?.matcher || []);
const matches = (p) => matchers.some((m) => (m.endsWith('/:path*') ? p.startsWith(m.slice(0, -7)) : m === p));

// Site-wide headers from vercel.json (source "/(.*)"), so a Content-Security-
// Policy that breaks the site fails here rather than in production. The
// per-path caching rules are deliberately left out — they only matter on a CDN.
const vercelJson = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
const siteHeaders = Object.fromEntries(
  (vercelJson.headers || [])
    .filter((h) => h.source === '/(.*)')
    .flatMap((h) => h.headers.map(({ key, value }) => [key.toLowerCase(), value])),
);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const exists = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

const toRequest = async (req) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  return new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });
};

const send = async (res, response) => {
  const headers = { ...siteHeaders };
  response.headers.forEach((v, k) => { if (k !== 'set-cookie') headers[k] = v; });
  const cookies = response.headers.getSetCookie?.() || [];
  if (cookies.length) headers['set-cookie'] = cookies;
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    const request = await toRequest(req);

    if (matches(url.pathname)) {
      const out = await mw.default(request);
      if (out && !out.headers.get('x-middleware-next')) return send(res, out);
    }

    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.slice(5).replace(/[^a-z0-9_-]/gi, '');
      const file = path.join(root, 'api', `${name}.js`);
      if (!(await exists(file))) { res.writeHead(404); return res.end('no such function'); }
      const mod = await import(pathToFileURL(file).href);
      const handler = mod.default?.fetch ? mod.default.fetch.bind(mod.default) : mod[req.method] || mod.default;
      return send(res, await handler(request));
    }

    // `new URL` normalizes `../` but not `%2e%2e`, so decode first and then
    // confirm the result is still inside dist/ before reading anything.
    let file = path.resolve(dist, `.${path.posix.normalize(decodeURIComponent(url.pathname))}`);
    if (file !== dist && !file.startsWith(dist + path.sep)) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      return res.end('403');
    }
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    if (!(await exists(file)) && (await exists(`${file}.html`))) file += '.html';
    if (!(await exists(file))) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('404'); }
    res.writeHead(200, { ...siteHeaders, 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(`500 ${err.message}`);
  }
}).listen(port, () => {
  console.log(`→ http://localhost:${port}`);
  console.log(`  gate: ${process.env.SITE_PASSWORD ? 'on' : 'off (no SITE_PASSWORD in .env)'} · tts: ${
    ['ELEVENLABS_API_KEY', 'AZURE_SPEECH_KEY', 'GOOGLE_TTS_KEY'].filter((k) => process.env[k]).map((k) => k.split('_')[0].toLowerCase()).join(', ') || 'browser only'
  } · stt: ${process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'browser only'}`);
});
