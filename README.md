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

## Known gaps

- Audio uses the browser's speech synthesis with a Ukrainian voice when one is
  installed; the design calls for native-speaker recordings.
- The language switcher (`EN ▾`) is presentational — ES/PT copy exists per term, but
  there is no UI-language routing yet.
- Term counts on the rail are real counts of what's in `data.js` (~55 terms), not the
  2 400 the design mocks up.
