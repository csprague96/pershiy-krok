# Перший Крок

Military Ukrainian for foreign volunteers and instructors — glossary, scenario-based
course tracks, graded speaking practice, and audio. Built from the `Site Design.dc.html`
Claude Design project (homepage direction `1c` "drill board", glossary `2a`/`4b`,
courses `4a`, scenario `2b`, mobile behaviour from turn `3`).

Static site, no framework. `src/` is the site; `scripts/build.mjs` copies it to `dist/`
and stamps build metadata. Two small Vercel Functions (`api/`) and one piece of
Routing Middleware (`middleware.js`) add on-demand speech and an access gate.

```bash
npm run build   # → dist/
npm run dev     # build + serve on http://localhost:3000 (gate + api/ mounted too)
npm run tts     # pre-generate pronunciation audio (see Audio)
```

## Layout

| Path | What |
| --- | --- |
| `src/index.html` | Homepage — drill board hero, sample tickets, word of the day |
| `src/glossary.html` | Searchable glossary: section rail, A–Я jump, expandable rows |
| `src/course.html` | Course tracks with progress |
| `src/scenario.html` | Scenario lesson — listen, speak (graded), choose, translate |
| `src/login.html` | Access-code page for the gated part of the site |
| `src/data.js` | Terms, sections, tracks, journeys → scenes → typed steps |
| `src/app.js` | Behaviour: search, filters, audio, speaking, build awareness |
| `src/styles.css` | Design tokens and components |
| `api/tts.js` | On-demand pronunciation audio (ElevenLabs → Azure → Google) |
| `api/stt.js` | Transcribes a recorded clip (ElevenLabs Scribe) |
| `api/login.js` | Exchanges the access code for a signed cookie |
| `middleware.js` | Redirects gated paths to `/login` without the cookie |
| `lib/` | Shared: session tokens, speech providers, phrase harvest, .env loader |
| `scripts/tts.mjs` | Batch audio generation into `src/audio/` |
| `scripts/serve.mjs` | Local server that mirrors Vercel (cleanUrls, middleware, api/) |

## Access gate

The course, the scenarios and both speech APIs sit behind a **shared access code**
so the paid speech key can't be hammered by anyone who finds the URL. The homepage
and glossary stay public (they only use pre-generated audio).

- Set `SITE_PASSWORD` on Vercel (and optionally `SESSION_SECRET`). With it unset,
  the gate is open — handy locally, dangerous in production once a key is set.
- `/login` takes the code and sets a signed, HttpOnly cookie good for 30 days.
  Wrong codes are throttled per IP.
- Which paths are gated is one list: `matcher` in `middleware.js`.
- Per-user accounts later: `lib/session.js` mints and verifies tokens; issue one per
  user instead of per shared code and nothing else has to change.

## Audio

Three tiers, best available first:

1. **Pre-generated files** in `src/audio/` (committed; served from the CDN).
   `npm run tts` synthesizes every Ukrainian string the UI can play — glossary terms
   and examples, dialogue and speaking lines, correct choice answers — and writes
   `manifest.json` mapping text → `{ file, provider, at }`. Existing files are kept,
   so re-runs only fill gaps. `npm run tts -- --upgrade` also replaces files made by
   a lesser provider (e.g. Google → ElevenLabs once a key is added); `--dry` lists
   what would happen. A **human recording dropped in at the manifest's filename with
   `provider: "human"` is never touched.**
2. **`/api/tts?text=…`** for anything not on disk — ElevenLabs
   (`eleven_multilingual_v2`), falling back to Azure then Google *per phrase* if a
   call fails. Only phrases present in `src/data.js` are accepted, responses are
   CDN-cached per text, and the gate applies.
3. The browser's own speech synthesis, if it has a Ukrainian voice.

Provider credentials go in `.env` locally and in Vercel's environment variables in
production — see `.env.example`. The tts script prefers ElevenLabs, then Azure, then
Google, and reports which provider made each file.

## Speaking steps

`speak` steps are graded. The learner records a clip, `/api/stt` transcribes it with
ElevenLabs Scribe (language pinned to Ukrainian), and `src/app.js` scores it against
the target: each target word takes its best Levenshtein match among the heard words,
combined with a character-bigram Dice score over the whole phrase. **70 % passes.**
Missed words are shown in red so the learner knows what to fix. A skip only appears
after three failed attempts; browsers without an STT API fall back to their own
speech recognition, then to record-and-listen, then to an honour button if there is
no microphone at all.

## Content model

`SCENARIOS` are journeys → scenes → typed steps (`line`, `speak`, `choice`,
`translate`, `info`); the comment block above `SCENARIOS` in `src/data.js` documents
each shape. Progress is stored per scene in localStorage. Every count on the site is
computed from the data.

Ukrainian in the new content was written by a non-native author — **have a native
speaker skim `src/data.js` before wide distribution**, especially the radio and
casualty phrasing, which units vary on.

## Knowing which build you are looking at

Every page carries the build that produced it:

- the footer shows `build <env> · <commit> · <date> UTC` plus a relative age, and links
  to `/build-info.json`;
- `<meta name="pk-build">` holds the full commit SHA;
- `/build-info.json` has the machine-readable record (timestamp, env, branch, commit,
  deployment URL, region, Node version);
- an open tab re-checks `/build-info.json` when it regains focus and every 5 minutes; if
  a newer commit has shipped, the footer switches to **"new build shipped — reload"**.

Values come from Vercel's build environment (`VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`,
`VERCEL_GIT_COMMIT_REF`, `VERCEL_URL`). Locally they fall back to `git`, and a `+` after
the commit means the working tree was dirty when the build ran.

## Vercel

`vercel.json` sets `buildCommand`, `outputDirectory: dist`, `cleanUrls`, cache headers,
and `functions` config for `api/*.js` (which includes `src/data.js` so the TTS
allow-list works). Environment variables to set in the project:

| Variable | Purpose |
| --- | --- |
| `SITE_PASSWORD` | the shared access code (required to close the gate) |
| `SESSION_SECRET` | optional; cookie signing key, rotate to log everyone out |
| `ELEVENLABS_API_KEY` | on-demand TTS + speech-to-text grading |
| `ELEVENLABS_VOICE_ID` | optional voice override |
| `GOOGLE_TTS_KEY` / `AZURE_SPEECH_*` | TTS fallbacks when ElevenLabs fails |

## Known gaps

- Audio is currently Google `uk-UA-Wavenet-A` for every phrase; run
  `npm run tts -- --upgrade` with an ElevenLabs key to replace it all.
- The gate is one shared code, not per-user accounts.
- No offline mode yet; the site needs a connection for audio and grading.
