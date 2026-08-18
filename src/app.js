/* Перший Крок — page behaviour. No framework, no build step beyond the stamper. */
(function () {
  const { SECTIONS, TERMS, TRACKS, SCENARIOS } = window.PK || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── Translation language (EN / ES / PT) ───────────────────
     One target language at a time; the other two show in expanded rows.
     Persisted; every page section that renders translations re-renders on
     change via the `rerenders` list. */
  const LANGS = { en: 'EN', es: 'ES', pt: 'PT' };
  let lang = localStorage.getItem('pk-lang');
  if (!LANGS[lang]) lang = 'en';
  const otherLangs = () => Object.keys(LANGS).filter((k) => k !== lang);
  const rerenders = [];

  const langBtn = $('.lang');
  if (langBtn) {
    const wrap = document.createElement('span');
    wrap.className = 'lang-wrap';
    langBtn.replaceWith(wrap);
    wrap.append(langBtn);
    langBtn.setAttribute('aria-haspopup', 'menu');
    langBtn.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'menu');
    wrap.append(menu);

    const paint = () => {
      langBtn.textContent = `${LANGS[lang]} ▾`;
      menu.innerHTML = Object.entries(LANGS)
        .map(([k, v]) => `<button type="button" role="menuitem" data-pick="${k}" aria-pressed="${k === lang}">${v}</button>`)
        .join('');
    };
    paint();

    langBtn.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      langBtn.setAttribute('aria-expanded', String(!menu.hidden));
    });
    menu.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-pick]');
      if (!pick) return;
      lang = pick.dataset.pick;
      localStorage.setItem('pk-lang', lang);
      paint();
      menu.hidden = true;
      langBtn.setAttribute('aria-expanded', 'false');
      rerenders.forEach((fn) => fn());
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target) && !menu.hidden) {
        menu.hidden = true;
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

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
     Pre-generated recordings (scripts/tts.mjs → /audio/) are preferred; any
     phrase without a file falls back to speech synthesis with a Ukrainian
     voice when one is installed. */
  let audioManifest = {};
  fetch('/audio/manifest.json')
    .then((r) => (r.ok ? r.json() : {}))
    .then((m) => { audioManifest = m; })
    .catch(() => {});
  let currentAudio = null;

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

  function play(text, btn) {
    const file = audioManifest[text];
    if (!file) return say(text, btn);
    if (currentAudio) currentAudio.pause();
    window.speechSynthesis?.cancel();
    const audio = new Audio(`/audio/${file}`);
    currentAudio = audio;
    if (btn) {
      btn.dataset.playing = 'true';
      const clear = () => { btn.dataset.playing = 'false'; };
      audio.addEventListener('ended', clear);
      audio.addEventListener('pause', clear);
      audio.addEventListener('error', () => { clear(); say(text, btn); }, { once: true });
    }
    audio.play().catch(() => say(text, btn));
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-say]');
    if (!btn) return;
    e.stopPropagation();
    play(btn.dataset.say, btn);
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
    // mode: 'sec' (one section) | 'alpha' (all terms А–Я with letter headers)
    const state = { q: params.get('q') || '', sec: hashSec || '02', mode: 'sec', letter: null };
    input.value = state.q;

    railEl.innerHTML = SECTIONS.map((s) => {
      const n = TERMS.filter((t) => t.sec === s.id).length;
      return `<button type="button" data-sec="${s.id}">
        <span>§ ${s.id} ${esc(s.uk)}</span><span class="c">${n}</span></button>`;
    }).join('');

    const letters = [...new Set(TERMS.map((t) => t.letter))].sort((a, b) => a.localeCompare(b, 'uk'));
    alphaEl.innerHTML = letters
      .map((l) => `<button type="button" data-letter="${esc(l)}">${esc(l)}</button>`)
      .join('');

    const byUk = [...TERMS].sort((a, b) => a.uk.localeCompare(b.uk, 'uk'));

    const termHtml = (t) => {
      const sec = SECTIONS.find((s) => s.id === t.sec);
      const others = otherLangs()
        .map((k) => `<span><strong>${LANGS[k]}</strong> ${esc(t[k])}</span>`)
        .join('');
      return `<button class="term" type="button" aria-expanded="false">
        <span class="term-row">
          <span class="term-uk">${esc(t.uk)}</span>
          <span class="term-tr">[${esc(t.tr)}]</span>
          <span class="term-en">${esc(t[lang])}</span>
          <span class="play" data-say="${esc(t.uk)}" role="button" tabindex="0" aria-label="Play ${esc(t.uk)}">▶</span>
        </span>
        <span class="term-more" hidden>
          ${others}
          ${t.example ? `<span>«${esc(t.example.uk)}» — “${esc(t.example.en)}”</span>` : ''}
          <span class="src">§${t.sec} ${esc(sec ? sec.uk : '')}</span>
        </span>
      </button>`;
    };

    const render = () => {
      $$('button', railEl).forEach((b) =>
        b.setAttribute('aria-pressed', String(state.mode === 'sec' && !state.q.trim() && b.dataset.sec === state.sec)));
      $$('button', alphaEl).forEach((b) =>
        b.style.color = state.mode === 'alpha' && b.dataset.letter === state.letter ? 'var(--yellow)' : '');

      const q = state.q.trim().toLowerCase();
      if (q) {
        const rows = TERMS.filter((t) =>
          [t.uk, t.tr, t.en, t.es, t.pt].some((v) => v.toLowerCase().includes(q)));
        headEl.innerHTML = `<h2>Пошук · Search “${esc(state.q)}”</h2><span class="meta">${rows.length} match${rows.length === 1 ? '' : 'es'} across all sections</span>`;
        list.innerHTML = rows.length
          ? rows.map(termHtml).join('')
          : '<p class="empty">Нічого не знайдено · nothing matched — try the Cyrillic, the transliteration, or your own language.</p>';
        return;
      }

      if (state.mode === 'alpha') {
        headEl.innerHTML = `<h2>А–Я — the whole glossary</h2><span class="meta">${TERMS.length} terms · alphabetical</span>`;
        list.innerHTML = letters.map((l) => {
          const group = byUk.filter((t) => t.letter === l);
          return `<div class="letter" id="L-${esc(l)}"><span>${esc(l)}</span><span class="bar"></span><span class="n">${group.length} term${group.length === 1 ? '' : 's'}</span></div>`
            + group.map(termHtml).join('');
        }).join('');
        return;
      }

      const sec = SECTIONS.find((s) => s.id === state.sec);
      const rows = TERMS.filter((t) => t.sec === state.sec);
      headEl.innerHTML = `<h2>§ ${sec.id} — ${esc(sec.uk)} · ${esc(sec.en)}</h2><span class="meta">${rows.length} terms</span>`;
      list.innerHTML = rows.map(termHtml).join('');
    };
    rerenders.push(render);

    railEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-sec]');
      if (!btn) return;
      Object.assign(state, { sec: btn.dataset.sec, mode: 'sec', letter: null, q: '' });
      input.value = '';
      render();
    });

    alphaEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-letter]');
      if (!btn) return;
      Object.assign(state, { mode: 'alpha', letter: btn.dataset.letter, q: '' });
      input.value = '';
      render();
      $(`#L-${CSS.escape(btn.dataset.letter)}`)?.scrollIntoView({ block: 'start' });
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

  /* ── Home: word of the day + sample-ticket translations ─── */
  const wotd = $('#wotd');
  if (wotd && TERMS) {
    const renderHome = () => {
      const day = Math.floor(Date.now() / 86400000);
      const t = TERMS[day % TERMS.length];
      wotd.innerHTML = `
        <span class="kicker" style="color:var(--grey-3)">Слово дня · Word of the day</span>
        <span style="font:700 30px var(--display)">${esc(t.uk)}</span>
        <span class="term-tr">[${esc(t.tr)}]</span>
        <span style="font:600 16px var(--sans)">${esc(t[lang])}</span>
        <button class="play" type="button" data-say="${esc(t.uk)}" aria-label="Play ${esc(t.uk)}">▶</button>`;
      $$('[data-term]').forEach((el) => {
        const term = TERMS.find((x) => x.uk === el.dataset.term);
        if (term) el.textContent = term[lang];
      });
      // Real counts, straight from the data — they grow as data.js does.
      const stats = $('#stats');
      if (stats) {
        const n = SCENARIOS.length;
        const scenWord = n === 1 ? 'сценарій' : n < 5 ? 'сценарії' : 'сценаріїв';
        stats.innerHTML = `${TERMS.length} термінів<br>${n} ${scenWord}`;
      }
    };
    rerenders.push(renderHome);
    renderHome();
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
      // Real progress: lines repeated in this track's scenario (same
      // localStorage the scenario page writes).
      const scen = SCENARIOS.find((x) => x.track === t.no);
      const total = scen.lines.length;
      const done = Math.min(parseInt(localStorage.getItem(`pk-scen-${t.no}`) || '0', 10) || 0, total);
      const pct = Math.round((done / total) * 100);
      const tag = t.tag + (done >= total ? ' · DONE ✓' : done ? ' · CONTINUE' : '');
      const cta = done >= total ? 'Ще раз · Again' : done ? 'Продовжити · Continue' : 'Почати · Start';
      return `<a class="ticket track ${s.cls} tilt-${(i % 4) + 1}" href="/scenario?track=${t.no}">
        <span class="top"><span class="no" style="color:${s.no}">${esc(tag)}</span><span class="lvl" style="color:${s.lvl}">${esc(t.level)}</span></span>
        <h2>${esc(t.uk)}<br>${esc(t.en)}</h2>
        <p>${esc(t.desc)}</p>
        <span class="progress">
          <span class="bar" style="background:${s.bar}"><i style="width:${pct}%;background:${s.fill}"></i></span>
          <span class="n">${done}/${total} lines</span>
        </span>
        <span class="cta" style="${s.cta}">${cta} →</span>
      </a>`;
    }).join('');
  }

  /* ── Scenario lesson ───────────────────────────────────── */
  const scriptEl = $('#script');
  if (scriptEl && SCENARIOS) {
    const track = new URLSearchParams(location.search).get('track');
    const scen = SCENARIOS.find((s) => s.track === track) || SCENARIOS.find((s) => s.track === '03');
    const next = SCENARIOS[(SCENARIOS.indexOf(scen) + 1) % SCENARIOS.length];
    const nextHref = `/scenario?track=${next.track}`;
    const total = scen.lines.length;

    // Progress is real: how many lines you've repeated, kept per scenario.
    const storeKey = `pk-scen-${scen.track}`;
    let at = Math.min(parseInt(localStorage.getItem(storeKey) || '0', 10) || 0, total);

    // Head — position is the scenario's real index, not a mocked "07 / 38".
    const pos = String(SCENARIOS.indexOf(scen) + 1).padStart(2, '0');
    document.title = `${scen.uk} · ${scen.en} — Сценарій ${pos} — Перший Крок`;
    $('#scen-kicker').textContent = `Сценарій ${pos} / ${String(SCENARIOS.length).padStart(2, '0')} · ${scen.category}`;
    $('#scen-title').innerHTML = `${esc(scen.uk)}<br><span class="hl">${esc(scen.en)}</span>`;
    const nextLink = $('#next-scen');
    nextLink.href = nextHref;
    nextLink.textContent = `Наступний сценарій: ${next.uk} →`;

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
      const sayText = l.lang === 'УК' ? l.uk : l.tr.replace(/\s*\[.*\]$/, '');
      return `<div class="line" data-state="${state}">
        <span class="who" data-lang="${esc(l.lang)}">${esc(l.lang)}</span>
        <span class="body">
          <span class="uk">${esc(l.uk)}</span>
          <span class="tr">${l.lang === 'УК' ? `[${esc(l.tr)}]` : esc(l.tr)}</span>
          ${l.en ? `<span class="en">${esc(l.en)}</span>` : ''}
          ${state === 'current' ? `<span class="acts">
            <button class="btn--ink" type="button" data-say="${esc(sayText)}">▶ Слухати</button>
            <button class="btn--ghost-ink" type="button" data-repeat>🎙 Повторити</button>
          </span>` : ''}
        </span>
        ${state === 'done' ? `<button class="play" type="button" data-say="${esc(l.uk)}" aria-label="Replay" style="margin-left:auto">▶</button>` : ''}
      </div>`;
    };

    const render = () => {
      const doneAll = at >= total;
      // Worked-through lines, the current one, and a single locked teaser.
      let html = scen.lines.slice(0, Math.min(at + 2, total)).map(lineHtml).join('');
      if (doneAll) {
        html += `<div class="line" data-state="current" style="flex-direction:column;align-items:stretch;gap:10px">
          <span style="font:700 19px var(--display)">Сценарій завершено ✓</span>
          <span style="font:600 14px var(--sans)">All ${total} lines repeated. Well done.</span>
          <span class="acts">
            <a class="btn--ink" href="${nextHref}" style="text-decoration:none">Наступний сценарій →</a>
            <button class="btn--ghost-ink" type="button" data-restart>↺ Спочатку</button>
          </span>
        </div>`;
      }
      scriptEl.innerHTML = html;
      const pct = Math.round((at / total) * 100);
      if (meterEl) meterEl.style.width = `${pct}%`;
      if (countEl) countEl.textContent = `lines repeated · ${at} / ${total}`;
    };

    scriptEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-restart]')) {
        at = 0;
        localStorage.setItem(storeKey, '0');
        render();
        return;
      }
      if (!e.target.closest('[data-repeat]')) return;
      at = Math.min(at + 1, total);
      localStorage.setItem(storeKey, String(at));
      render();
      $('.line[data-state="current"]', scriptEl)?.scrollIntoView({ block: 'nearest' });
    });

    render();

    const keyEl = $('#keyterms');
    if (keyEl && TERMS) {
      const renderKeys = () => {
        keyEl.innerHTML = scen.keyTerms
          .map((uk) => TERMS.find((t) => t.uk === uk))
          .filter(Boolean)
          .map((t) => `<li><strong>${esc(t.uk)}</strong> <span class="tr">[${esc(t.tr)}]</span> — ${esc(t[lang])}</li>`)
          .join('');
      };
      rerenders.push(renderKeys);
      renderKeys();
    }

    const drillEl = $('#drill-options');
    if (drillEl) {
      const verdict = $('#drill-verdict');
      $('#drill-q').textContent = scen.drill.q;
      drillEl.innerHTML = scen.drill.options
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
        if (right) play(btn.textContent.replace(' ✓', ''), null);
      });
    }
  }
})();
