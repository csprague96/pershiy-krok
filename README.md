# Перший Крок

Military Ukrainian for foreign volunteers and instructors — glossary, scenario-based
course tracks, and audio. Built from the `Site Design.dc.html` Claude Design project
(homepage direction `1c` "drill board", glossary `2a`/`4b`, courses `4a`, scenario `2b`,
mobile behaviour from turn `3`).

Static site, no framework. `src/` is the site; `scripts/build.mjs` copies it to `dist/`
and stamps build metadata.

```bash
npm run build   # → dist/
npm run dev     # build + serve on http://localhost:3000
```

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

`vercel.json` sets `buildCommand: node scripts/build.mjs`, `outputDirectory: dist`, and
`cleanUrls` (so `/glossary` serves `glossary.html`). No environment variables needed —
import the repo and deploy.

## Layout

| Path | What |
| --- | --- |
| `src/index.html` | Homepage — drill board hero, sample tickets, word of the day |
| `src/glossary.html` | Searchable glossary: section rail, A–Я jump, expandable rows |
| `src/course.html` | Course tracks with progress |
| `src/scenario.html` | Scenario lesson — listen, repeat, unlock the next line |
| `src/data.js` | Terms, sections, tracks, scenario script |
| `src/app.js` | Behaviour: search, filters, drill, audio, build awareness |
| `src/styles.css` | Design tokens and components |

## Audio

`npm run tts` pre-generates an MP3 for every Ukrainian phrase the UI can play
(glossary terms + scenario lines) into `src/audio/`, plus a `manifest.json`
mapping text → file. The front end prefers those files and falls back to browser
speech synthesis for any phrase without one — so the site works mid-migration,
and a **human recording dropped in at the same filename simply wins** (existing
files are never overwritten; re-runs only synthesize what's missing).

Credentials go in `.env` (see `.env.example`): Azure Speech
(`uk-UA-OstapNeural`, default) or Google Cloud TTS (`uk-UA-Wavenet-A`). The
whole current corpus is a few thousand characters — comfortably inside either
free tier. This is a manual step, never part of the Vercel build; generated
audio is committed and served statically.

## Known gaps

- Until `npm run tts` has been run (or human recordings added), audio falls back
  to the browser's speech synthesis; the design calls for native-speaker
  recordings, especially for shouted commands.
- The language switcher (`EN ▾`) is presentational — ES/PT copy exists per term, but
  there is no UI-language routing yet.
- Term counts on the rail are real counts of what's in `data.js` (~55 terms), not the
  2 400 the design mocks up.
