/* Перший Крок — page behaviour. No framework, no build step beyond the stamper. */
(function () {
  const { SECTIONS, TERMS, TRACKS, SCENARIO } = window.PK || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── Build awareness ───────────────────────────────────────
     Each page is stamped at build time (scripts/build.mjs). We render how long
     ago that was, and poll /build-info.json so a tab left open on an older
     deploy can tell you a newer build has shipped. */
  const buildEl = $('.build');
  if (buildEl) {
    const builtAt = new Date(buildEl.dataset.builtAt);
    const rel = $('[data-build-rel]', buildEl);

    const ago = () => {
      const mins = Math.max(0, Math.round((Date.now() - builtAt) / 60000));
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.round(mins / 60);
      return hrs < 48 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`;
    };
    const tick = () => { if (rel && !buildEl.dataset.stale) rel.textContent = `(${ago()})`; };
    tick();
    setInterval(tick, 60000);

    const mine = document.querySelector('meta[name="pk-build"]')?.content;
    const check = async () => {
      if (document.hidden || buildEl.dataset.stale) return;
      try {
        const info = await (await fetch('/build-info.json', { cache: 'no-store' })).json();
        if (mine && info.commit && info.commit !== mine) {
          buildEl.dataset.stale = 'true';
          if (rel) rel.textContent = '· new build shipped — reload';
          buildEl.style.color = 'var(--yellow)';
        }
      } catch { /* offline: keep the stamped value */ }
    };
    setInterval(check, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', check);
    console.info(`Перший Крок · ${buildEl.title}`);
  }

  /* ── Pronunciation ─────────────────────────────────────────
     Native-speaker recordings are not in this build; until they are we fall
     back to speech synthesis with a Ukrainian voice when one is installed. */
  let ukVoice = null;
  const pickVoice = () => {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    ukVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('uk')) || null;
  };
  if (window.speechSynthesis) {
    pickVoice();
    speechSynthesis.addEventListener('voiceschanged', pickVoice);
  }

  function say(text, btn) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = ukVoice?.lang || 'uk-UA';
    if (ukVoice) u.voice = ukVoice;
    u.rate = 0.9;
    if (btn) {
      btn.dataset.playing = 'true';
      const clear = () => { btn.dataset.playing = 'false'; };
      u.addEventListener('end', clear);
      u.addEventListener('error', clear);
    }
    speechSynthesis.speak(u);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-say]');
    if (!btn) return;
    e.stopPropagation();
    say(btn.dataset.say, btn);
  });

  /* ── Glossary ──────────────────────────────────────────── */
  const list = $('#terms');
  if (list && TERMS) {
    const railEl = $('#rail');
    const alphaEl = $('#alpha');
    const input = $('#q');
    const headEl = $('#terms-head');
    // Deep links: /glossary?q=джгут from the home search, /glossary#03 from the section cards.
    const params = new URLSearchParams(location.search);
    const hashSec = SECTIONS.some((s) => `#${s.id}` === location.hash) ? location.hash.slice(1) : null;
    const state = { q: params.get('q') || '', sec: hashSec || '02' };
    input.value = state.q;

    railEl.innerHTML = SECTIONS.map((s) => {
      const n = TERMS.filter((t) => t.sec === s.id).length;
      return `<button type="button" data-sec="${s.id}" aria-pressed="${s.id === state.sec}">
        <span>§ ${s.id} ${esc(s.uk)}</span><span class="c">${n}</span></button>`;
    }).join('');

    const letters = [...new Set(TERMS.map((t) => t.letter))].sort((a, b) => a.localeCompare(b, 'uk'));
    alphaEl.innerHTML = letters
      .map((l) => `<button type="button" data-letter="${esc(l)}">${esc(l)}</button>`)
      .join('');

    const matches = () => {
      const q = state.q.trim().toLowerCase();
      if (q) return TERMS.filter((t) => [t.uk, t.tr, t.en, t.es, t.pt].some((v) => v.toLowerCase().includes(q)));
      return TERMS.filter((t) => t.sec === state.sec);
    };

    const termHtml = (t, i) => {
      const sec = SECTIONS.find((s) => s.id === t.sec);
      return `<button class="term" type="button" aria-expanded="false" data-i="${i}">
        <span class="term-row">
          <span class="term-uk">${esc(t.uk)}</span>
          <span class="term-tr">[${esc(t.tr)}]</span>
          <span class="term-en">${esc(t.en)}</span>
          <span class="play" data-say="${esc(t.uk)}" role="button" tabindex="0" aria-label="Play ${esc(t.uk)}">▶</span>
        </span>
        <span class="term-more" hidden>
          <span><strong>ES</strong> ${esc(t.es)}</span>
          <span><strong>PT</strong> ${esc(t.pt)}</span>
          ${t.example ? `<span>«${esc(t.example.uk)}» — “${esc(t.example.en)}”</span>` : ''}
          <span class="src">§${t.sec} ${esc(sec ? sec.uk : '')}</span>
        </span>
      </button>`;
    };

    const render = () => {
      const rows = matches();
      const sec = SECTIONS.find((s) => s.id === state.sec);
      headEl.innerHTML = state.q
        ? `<h2>Пошук · Search “${esc(state.q)}”</h2><span class="meta">${rows.length} match${rows.length === 1 ? '' : 'es'} across all sections</span>`
        : `<h2>§ ${sec.id} — ${esc(sec.uk)} · ${esc(sec.en)}</h2><span class="meta">${rows.length} terms</span>`;
      list.innerHTML = rows.length
        ? rows.map(termHtml).join('')
        : '<p class="empty">Нічого не знайдено · nothing matched — try the Cyrillic, the transliteration, or your own language.</p>';
      list.dataset.rows = JSON.stringify(rows.map((t) => TERMS.indexOf(t)));
    };

    railEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-sec]');
      if (!btn) return;
      state.sec = btn.dataset.sec;
      state.q = '';
      input.value = '';
      $$('button', railEl).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      render();
    });

    alphaEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-letter]');
      if (!btn) return;
      state.q = '';
      input.value = '';
      render();
      const target = $$('.term-uk', list).find((el) => el.textContent[0].toUpperCase() === btn.dataset.letter);
      if (target) target.closest('.term').scrollIntoView({ block: 'center' });
      else {
        state.q = btn.dataset.letter.toLowerCase();
        render();
      }
    });

    input.addEventListener('input', () => { state.q = input.value; render(); });
    $('#search-form').addEventListener('submit', (e) => e.preventDefault());

    list.addEventListener('click', (e) => {
      const term = e.target.closest('.term');
      if (!term) return;
      const open = term.getAttribute('aria-expanded') === 'true';
      term.setAttribute('aria-expanded', String(!open));
      $('.term-more', term).hidden = open;
    });

    render();
  }

  /* ── Home: word of the day (stable per UTC day) ─────────── */
  const wotd = $('#wotd');
  if (wotd && TERMS) {
    const day = Math.floor(Date.now() / 86400000);
    const t = TERMS[day % TERMS.length];
    wotd.innerHTML = `
      <span class="kicker" style="color:var(--grey-3)">Слово дня · Word of the day</span>
      <span style="font:700 30px var(--display)">${esc(t.uk)}</span>
      <span class="term-tr">[${esc(t.tr)}]</span>
      <span style="font:600 16px var(--sans)">${esc(t.en)}</span>
      <button class="play" type="button" data-say="${esc(t.uk)}" aria-label="Play ${esc(t.uk)}">▶</button>`;
  }

  /* ── Courses ───────────────────────────────────────────── */
  const tracksEl = $('#tracks');
  if (tracksEl && TRACKS) {
    const tone = {
      yellow: { cls: 'ticket--yellow', no: '#3a3e42', lvl: '#141517', bar: '#141517', fill: 'var(--blue)', cta: 'background:#141517;color:#ffd500' },
      cream: { cls: '', no: 'var(--grey-3)', lvl: 'var(--grey-3)', bar: 'var(--cream-2)', fill: 'var(--blue)', cta: 'border:1.5px solid #141517;color:#141517' },
      blue: { cls: 'ticket--blue', no: 'var(--blue-pale)', lvl: 'var(--blue-pale)', bar: 'var(--blue-deep)', fill: 'var(--yellow)', cta: 'background:#ffd500;color:#141517' },
    };
    tracksEl.innerHTML = TRACKS.map((t, i) => {
      const s = tone[t.tone];
      const pct = Math.round((t.done / t.total) * 100);
      return `<a class="ticket track ${s.cls} tilt-${(i % 4) + 1}" href="/scenario">
        <span class="top"><span class="no" style="color:${s.no}">${esc(t.tag)}</span><span class="lvl" style="color:${s.lvl}">${esc(t.level)}</span></span>
        <h2>${esc(t.uk)}<br>${esc(t.en)}</h2>
        <p>${esc(t.desc)}</p>
        <span class="progress">
          <span class="bar" style="background:${s.bar}"><i style="width:${pct}%;background:${s.fill}"></i></span>
          <span class="n">${t.done}/${t.total} lessons</span>
        </span>
        <span class="cta" style="${s.cta}">${t.done ? 'Продовжити · Continue' : 'Почати · Start'} →</span>
      </a>`;
    }).join('');
  }

  /* ── Scenario lesson ───────────────────────────────────── */
  const scriptEl = $('#script');
  if (scriptEl && SCENARIO) {
    let at = 2; // lines before this are already worked through
    const meterEl = $('#meter');
    const countEl = $('#phrase-count');

    const lineHtml = (l, i) => {
      const state = i < at ? 'done' : i === at ? 'current' : 'locked';
      if (state === 'locked') {
        return `<div class="line" data-state="locked">
          <span class="who" data-lang="${esc(l.lang)}" style="background:var(--line);color:var(--grey-3)">${esc(l.lang)}</span>
          <span>next line unlocks after you repeat the phrase…</span>
        </div>`;
      }
      return `<div class="line" data-state="${state}">
        <span class="who" data-lang="${esc(l.lang)}">${esc(l.lang)}</span>
        <span class="body">
          <span class="uk">${esc(l.uk)}</span>
          <span class="tr">${l.lang === 'УК' ? `[${esc(l.tr)}]` : esc(l.tr)}</span>
          ${l.en ? `<span class="en">${esc(l.en)}</span>` : ''}
          ${state === 'current' ? `<span class="acts">
            <button class="btn--ink" type="button" data-say="${esc(l.lang === 'УК' ? l.uk : l.tr.replace(/\s*\[.*\]$/, ''))}">▶ Слухати</button>
            <button class="btn--ghost-ink" type="button" data-repeat>🎙 Повторити</button>
          </span>` : ''}
        </span>
        ${state === 'done' ? `<button class="play" type="button" data-say="${esc(l.uk)}" aria-label="Replay" style="margin-left:auto">▶</button>` : ''}
      </div>`;
    };

    const render = () => {
      // Show what's been worked through, the current line, and one locked teaser.
      scriptEl.innerHTML = SCENARIO.lines.slice(0, at + 2).map(lineHtml).join('');
      const learned = Math.min(SCENARIO.phrases, SCENARIO.learned + Math.max(0, at - 2));
      const pct = Math.round((learned / SCENARIO.phrases) * 100);
      if (meterEl) meterEl.style.width = `${pct}%`;
      if (countEl) countEl.textContent = `phrases learned · ${learned} / ${SCENARIO.phrases}`;
    };

    scriptEl.addEventListener('click', (e) => {
      if (!e.target.closest('[data-repeat]')) return;
      at = Math.min(at + 1, SCENARIO.lines.length - 1);
      render();
      $('.line[data-state="current"]', scriptEl)?.scrollIntoView({ block: 'nearest' });
    });

    render();

    const keyEl = $('#keyterms');
    if (keyEl && TERMS) {
      keyEl.innerHTML = SCENARIO.keyTerms
        .map((uk) => TERMS.find((t) => t.uk === uk))
        .filter(Boolean)
        .map((t) => `<li><strong>${esc(t.uk)}</strong> <span class="tr">[${esc(t.tr)}]</span> — ${esc(t.en)}</li>`)
        .join('');
    }

    const drillEl = $('#drill-options');
    if (drillEl) {
      const verdict = $('#drill-verdict');
      drillEl.innerHTML = SCENARIO.drill.options
        .map((o) => `<button type="button" data-answer="${o.right ? 'right' : 'wrong'}">${esc(o.label)}</button>`)
        .join('');
      drillEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-answer]');
        if (!btn) return;
        $$('button', drillEl).forEach((b) => delete b.dataset.picked);
        btn.dataset.picked = 'true';
        const right = btn.dataset.answer === 'right';
        if (right) btn.textContent = `${btn.textContent.replace(' ✓', '')} ✓`;
        verdict.textContent = right ? 'Правильно · correct' : 'Ще раз · try again';
        if (right) say(btn.textContent.replace(' ✓', ''), null);
      });
    }
  }
})();
