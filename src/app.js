/* Перший Крок — page behaviour. No framework, no build step beyond the stamper. */
(function () {
  const { SECTIONS, TERMS, TRACKS, SCENARIOS } = window.PK || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── Site language (EN / ES / PT) ──────────────────────────
     One language at a time: it is both the translation target for terms and
     the language of the UI chrome. First visit defaults from the browser's
     language list; the choice persists. Every section that renders language-
     dependent content re-renders on change via the `rerenders` list. */
  const LANGS = { en: 'EN', es: 'ES', pt: 'PT' };
  let lang = localStorage.getItem('pk-lang');
  if (!LANGS[lang]) {
    const preferred = (navigator.languages || [navigator.language || ''])
      .map((l) => String(l).slice(0, 2).toLowerCase());
    lang = preferred.find((l) => LANGS[l]) || 'en';
  }
  const rerenders = [];

  /* UI strings. Ukrainian halves of «uk · translation» pairs live in the HTML;
     these are the reader-language halves and standalone UI text. */
  const I18N = {
    en: {
      'nav.glossary': 'Glossary', 'nav.course': 'Course', 'nav.scenarios': 'Scenarios',
      'tab.home': 'Home', 'tab.glossary': 'Glossary', 'tab.scenarios': 'Scenarios', 'tab.progress': 'Progress',
      'hero.tagline': '— MILITARY LANGUAGE, FIRST STEP',
      'hero.p': 'Ranks, commands, gear, medical. Cyrillic + transliteration + audio, so you can understand your unit from day one — even before you can read a word.',
      'hero.search_ph': 'Search any language… “стій”, “halt”, “alto”',
      'home.kick_command': 'Command · 04', 'home.kick_medical': 'Medical · 11',
      'home.wotd': 'Word of the day',
      'home.open_glossary': 'Open the glossary →',
      'stats.terms': 'terms', 'stats.scenarios': 'scenarios',
      'footer.free': 'free for volunteers and instructors.',
      'glossary.note': 'click a row to open translations and an example',
      'glossary.search_ph': 'Search in any language… “джгут”, “tourniquet”, “torniquete”',
      'glossary.search': 'Search', 'glossary.matches': 'matches across all sections',
      'glossary.empty': 'nothing matched — try the Cyrillic, the transliteration, or your own language.',
      'glossary.whole': 'the whole glossary', 'glossary.alpha_meta': 'alphabetical',
      'glossary.terms': 'terms', 'glossary.term': 'term',
      'course.note': 'pick a track — each one is scenario-based, with audio',
      'course.start': 'Start', 'course.continue': 'Continue', 'course.again': 'Again',
      'course.tag_done': 'DONE ✓', 'course.tag_continue': 'CONTINUE', 'course.lines': 'lines',
      'course.soon': 'SOON', 'course.radio': 'Radio comms', 'course.paper': 'Paperwork & HQ',
      'course.request': 'request a track →',
      'scen.pos': 'Scenario', 'scen.next': 'Next scenario:',
      'scen.lines_repeated': 'lines repeated',
      'scen.locked': 'next line unlocks after you repeat the phrase…',
      'scen.done_body': 'All {n} lines repeated. Well done.',
      'scen.listen': 'Listen', 'scen.repeat': 'Repeat', 'scen.restart': 'Restart',
      'scen.keyterms': 'Key terms', 'scen.drill': 'Quick drill',
      'scen.correct': 'correct', 'scen.tryagain': 'try again',
    },
    es: {
      'nav.glossary': 'Glosario', 'nav.course': 'Curso', 'nav.scenarios': 'Escenarios',
      'tab.home': 'Inicio', 'tab.glossary': 'Glosario', 'tab.scenarios': 'Escenarios', 'tab.progress': 'Progreso',
      'hero.tagline': '— LENGUA MILITAR, PRIMER PASO',
      'hero.p': 'Rangos, órdenes, equipo, medicina. Cirílico + transliteración + audio, para entender a tu unidad desde el primer día — incluso antes de poder leer una palabra.',
      'hero.search_ph': 'Busca en cualquier idioma… «стій», «alto»',
      'home.kick_command': 'Orden · 04', 'home.kick_medical': 'Médico · 11',
      'home.wotd': 'Palabra del día',
      'home.open_glossary': 'Abrir el glosario →',
      'stats.terms': 'términos', 'stats.scenarios': 'escenarios',
      'footer.free': 'gratis para voluntarios e instructores.',
      'glossary.note': 'toca una fila para ver traducciones y un ejemplo',
      'glossary.search_ph': 'Busca en cualquier idioma… «джгут», «torniquete»',
      'glossary.search': 'Búsqueda', 'glossary.matches': 'coincidencias en todas las secciones',
      'glossary.empty': 'sin resultados — prueba el cirílico, la transliteración o tu idioma.',
      'glossary.whole': 'todo el glosario', 'glossary.alpha_meta': 'alfabético',
      'glossary.terms': 'términos', 'glossary.term': 'término',
      'course.note': 'elige una pista — cada una se basa en escenarios, con audio',
      'course.start': 'Empezar', 'course.continue': 'Continuar', 'course.again': 'Otra vez',
      'course.tag_done': 'HECHO ✓', 'course.tag_continue': 'CONTINUAR', 'course.lines': 'líneas',
      'course.soon': 'PRONTO', 'course.radio': 'Radiocomunicaciones', 'course.paper': 'Documentación y cuartel',
      'course.request': 'pide una pista →',
      'scen.pos': 'Escenario', 'scen.next': 'Siguiente escenario:',
      'scen.lines_repeated': 'líneas repetidas',
      'scen.locked': 'la siguiente línea se desbloquea cuando repites la frase…',
      'scen.done_body': 'Las {n} líneas repetidas. ¡Bien hecho!',
      'scen.listen': 'Escuchar', 'scen.repeat': 'Repetir', 'scen.restart': 'Desde el principio',
      'scen.keyterms': 'Palabras clave', 'scen.drill': 'Ejercicio rápido',
      'scen.correct': 'correcto', 'scen.tryagain': 'inténtalo otra vez',
    },
    pt: {
      'nav.glossary': 'Glossário', 'nav.course': 'Curso', 'nav.scenarios': 'Cenários',
      'tab.home': 'Início', 'tab.glossary': 'Glossário', 'tab.scenarios': 'Cenários', 'tab.progress': 'Progresso',
      'hero.tagline': '— LÍNGUA MILITAR, PRIMEIRO PASSO',
      'hero.p': 'Patentes, comandos, equipamento, medicina. Cirílico + transliteração + áudio, para entender sua unidade desde o primeiro dia — mesmo antes de conseguir ler uma palavra.',
      'hero.search_ph': 'Busque em qualquer idioma… «стій», «alto»',
      'home.kick_command': 'Comando · 04', 'home.kick_medical': 'Médico · 11',
      'home.wotd': 'Palavra do dia',
      'home.open_glossary': 'Abrir o glossário →',
      'stats.terms': 'termos', 'stats.scenarios': 'cenários',
      'footer.free': 'gratuito para voluntários e instrutores.',
      'glossary.note': 'clique numa linha para ver traduções e um exemplo',
      'glossary.search_ph': 'Busque em qualquer idioma… «джгут», «torniquete»',
      'glossary.search': 'Busca', 'glossary.matches': 'resultados em todas as seções',
      'glossary.empty': 'nada encontrado — tente o cirílico, a transliteração ou o seu idioma.',
      'glossary.whole': 'o glossário completo', 'glossary.alpha_meta': 'alfabético',
      'glossary.terms': 'termos', 'glossary.term': 'termo',
      'course.note': 'escolha uma trilha — cada uma é baseada em cenários, com áudio',
      'course.start': 'Começar', 'course.continue': 'Continuar', 'course.again': 'De novo',
      'course.tag_done': 'FEITO ✓', 'course.tag_continue': 'CONTINUAR', 'course.lines': 'linhas',
      'course.soon': 'EM BREVE', 'course.radio': 'Comunicações de rádio', 'course.paper': 'Documentação e QG',
      'course.request': 'peça uma trilha →',
      'scen.pos': 'Cenário', 'scen.next': 'Próximo cenário:',
      'scen.lines_repeated': 'linhas repetidas',
      'scen.locked': 'a próxima linha desbloqueia quando você repete a frase…',
      'scen.done_body': 'Todas as {n} linhas repetidas. Muito bem!',
      'scen.listen': 'Ouvir', 'scen.repeat': 'Repetir', 'scen.restart': 'Do início',
      'scen.keyterms': 'Palavras-chave', 'scen.drill': 'Exercício rápido',
      'scen.correct': 'correto', 'scen.tryagain': 'tente de novo',
    },
  };
  const t = (key) => I18N[lang][key] ?? I18N.en[key] ?? '';
  const otherLangs = () => Object.keys(LANGS).filter((k) => k !== lang);

  /* Static chrome: any element with data-i18n / data-i18n-ph gets its text /
     placeholder from the dictionary; data-sec-desc pulls a section blurb. */
  const applyStatic = () => {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    if (SECTIONS) {
      $$('[data-sec-desc]').forEach((el) => {
        const sec = SECTIONS.find((s) => s.id === el.dataset.secDesc);
        if (sec) el.textContent = sec[lang];
      });
    }
    // Hero: ГОВОРИ, then SPEAK / HABLA / FALA — the reader's language in yellow.
    const heroes = $$('[data-hero]');
    if (heroes.length) {
      const dims = ['var(--blue-lit)', 'var(--cream-2)'];
      let d = 0;
      heroes.forEach((el) => {
        el.style.color = el.dataset.hero === lang ? 'var(--yellow)' : dims[d++ % dims.length];
      });
    }
  };
  rerenders.push(applyStatic);

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

    // Section rail in the reader's language — they can't read the Cyrillic yet;
    // the section header still shows the Ukrainian name alongside.
    const renderRail = () => {
      railEl.innerHTML = SECTIONS.map((s) => {
        const n = TERMS.filter((tm) => tm.sec === s.id).length;
        return `<button type="button" data-sec="${s.id}">
          <span>§ ${s.id} ${esc(s[lang])}</span><span class="c">${n}</span></button>`;
      }).join('');
    };
    renderRail();

    const letters = [...new Set(TERMS.map((tm) => tm.letter))].sort((a, b) => a.localeCompare(b, 'uk'));
    alphaEl.innerHTML = letters
      .map((l) => `<button type="button" data-letter="${esc(l)}">${esc(l)}</button>`)
      .join('');

    const byUk = [...TERMS].sort((a, b) => a.uk.localeCompare(b.uk, 'uk'));

    const nTerms = (n) => `${n} ${n === 1 ? t('glossary.term') : t('glossary.terms')}`;

    const termHtml = (tm) => {
      const sec = SECTIONS.find((s) => s.id === tm.sec);
      const others = otherLangs()
        .map((k) => `<span><strong>${LANGS[k]}</strong> ${esc(tm[k])}</span>`)
        .join('');
      const ex = tm.example;
      return `<button class="term" type="button" aria-expanded="false">
        <span class="term-row">
          <span class="term-uk">${esc(tm.uk)}</span>
          <span class="term-tr">[${esc(tm.tr)}]</span>
          <span class="term-en">${esc(tm[lang])}</span>
          <span class="play" data-say="${esc(tm.uk)}" role="button" tabindex="0" aria-label="Play ${esc(tm.uk)}">▶</span>
        </span>
        <span class="term-more" hidden>
          ${others}
          ${ex ? `<span>«${esc(ex.uk)}» — “${esc(ex[lang] || ex.en)}”</span>` : ''}
          <span class="src">§${tm.sec} ${esc(sec ? sec[lang] : '')}</span>
        </span>
      </button>`;
    };

    const render = () => {
      renderRail();
      $$('button', railEl).forEach((b) =>
        b.setAttribute('aria-pressed', String(state.mode === 'sec' && !state.q.trim() && b.dataset.sec === state.sec)));
      $$('button', alphaEl).forEach((b) =>
        b.style.color = state.mode === 'alpha' && b.dataset.letter === state.letter ? 'var(--yellow)' : '');

      const q = state.q.trim().toLowerCase();
      if (q) {
        const rows = TERMS.filter((tm) =>
          [tm.uk, tm.tr, tm.en, tm.es, tm.pt].some((v) => v.toLowerCase().includes(q)));
        headEl.innerHTML = `<h2>Пошук · ${esc(t('glossary.search'))} “${esc(state.q)}”</h2><span class="meta">${rows.length} ${esc(t('glossary.matches'))}</span>`;
        list.innerHTML = rows.length
          ? rows.map(termHtml).join('')
          : `<p class="empty">Нічого не знайдено · ${esc(t('glossary.empty'))}</p>`;
        return;
      }

      if (state.mode === 'alpha') {
        headEl.innerHTML = `<h2>А–Я — ${esc(t('glossary.whole'))}</h2><span class="meta">${TERMS.length} ${esc(t('glossary.terms'))} · ${esc(t('glossary.alpha_meta'))}</span>`;
        list.innerHTML = letters.map((l) => {
          const group = byUk.filter((tm) => tm.letter === l);
          return `<div class="letter" id="L-${esc(l)}"><span>${esc(l)}</span><span class="bar"></span><span class="n">${nTerms(group.length)}</span></div>`
            + group.map(termHtml).join('');
        }).join('');
        return;
      }

      const sec = SECTIONS.find((s) => s.id === state.sec);
      const rows = TERMS.filter((tm) => tm.sec === state.sec);
      headEl.innerHTML = `<h2>§ ${sec.id} — ${esc(sec.uk)} · ${esc(sec[lang])}</h2><span class="meta">${rows.length} ${esc(t('glossary.terms'))}</span>`;
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
      const tm = TERMS[day % TERMS.length];
      wotd.innerHTML = `
        <span class="kicker" style="color:var(--grey-3)">Слово дня · ${esc(t('home.wotd'))}</span>
        <span style="font:700 30px var(--display)">${esc(tm.uk)}</span>
        <span class="term-tr">[${esc(tm.tr)}]</span>
        <span style="font:600 16px var(--sans)">${esc(tm[lang])}</span>
        <button class="play" type="button" data-say="${esc(tm.uk)}" aria-label="Play ${esc(tm.uk)}">▶</button>`;
      $$('[data-term]').forEach((el) => {
        const term = TERMS.find((x) => x.uk === el.dataset.term);
        if (term) el.textContent = term[lang];
      });
      // Real counts, straight from the data — they grow as data.js does.
      const stats = $('#stats');
      if (stats) {
        stats.innerHTML = `${TERMS.length} ${esc(t('stats.terms'))}<br>${SCENARIOS.length} ${esc(t('stats.scenarios'))}`;
      }
    };
    rerenders.push(renderHome);
  }

  /* ── Courses ───────────────────────────────────────────── */
  const tracksEl = $('#tracks');
  if (tracksEl && TRACKS) {
    const tone = {
      yellow: { cls: 'ticket--yellow', no: '#3a3e42', lvl: '#141517', bar: '#141517', fill: 'var(--blue)', cta: 'background:#141517;color:#ffd500' },
      cream: { cls: '', no: 'var(--grey-3)', lvl: 'var(--grey-3)', bar: 'var(--cream-2)', fill: 'var(--blue)', cta: 'border:1.5px solid #141517;color:#141517' },
      blue: { cls: 'ticket--blue', no: 'var(--blue-pale)', lvl: 'var(--blue-pale)', bar: 'var(--blue-deep)', fill: 'var(--yellow)', cta: 'background:#ffd500;color:#141517' },
    };
    const renderTracks = () => {
      tracksEl.innerHTML = TRACKS.map((tk, i) => {
        const s = tone[tk.tone];
        // Real progress: lines repeated in this track's scenario (same
        // localStorage the scenario page writes).
        const scen = SCENARIOS.find((x) => x.track === tk.no);
        const total = scen.lines.length;
        const done = Math.min(parseInt(localStorage.getItem(`pk-scen-${tk.no}`) || '0', 10) || 0, total);
        const pct = Math.round((done / total) * 100);
        const tag = tk.tag
          + (tk.tagNote ? ` · ${tk.tagNote[lang]}` : '')
          + (done >= total ? ` · ${t('course.tag_done')}` : done ? ` · ${t('course.tag_continue')}` : '');
        const cta = done >= total ? `Ще раз · ${t('course.again')}` : done ? `Продовжити · ${t('course.continue')}` : `Почати · ${t('course.start')}`;
        return `<a class="ticket track ${s.cls} tilt-${(i % 4) + 1}" href="/scenario?track=${tk.no}">
          <span class="top"><span class="no" style="color:${s.no}">${esc(tag)}</span><span class="lvl" style="color:${s.lvl}">${esc(tk.level)}</span></span>
          <h2>${esc(tk.uk)}<br>${esc(tk[lang])}</h2>
          <p>${esc(tk.desc[lang])}</p>
          <span class="progress">
            <span class="bar" style="background:${s.bar}"><i style="width:${pct}%;background:${s.fill}"></i></span>
            <span class="n">${done}/${total} ${esc(t('course.lines'))}</span>
          </span>
          <span class="cta" style="${s.cta}">${cta} →</span>
        </a>`;
      }).join('');
    };
    rerenders.push(renderTracks);
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
    const renderHead = () => {
      document.title = `${scen.uk} · ${scen[lang]} — Сценарій ${pos} — Перший Крок`;
      $('#scen-kicker').textContent = `${t('scen.pos')} ${pos} / ${String(SCENARIOS.length).padStart(2, '0')} · ${scen.category[lang]}`;
      $('#scen-title').innerHTML = `${esc(scen.uk)}<br><span class="hl">${esc(scen[lang])}</span>`;
      const nextLink = $('#next-scen');
      nextLink.href = nextHref;
      nextLink.textContent = `${t('scen.next')} ${next.uk} →`;
    };
    rerenders.push(renderHead);

    const meterEl = $('#meter');
    const countEl = $('#phrase-count');

    const lineHtml = (l, i) => {
      const state = i < at ? 'done' : i === at ? 'current' : 'locked';
      const isUk = l.lang === 'УК';
      // Every line teaches the Ukrainian; the badge shows whose turn it is —
      // the foreign badge follows the picked language.
      const who = isUk ? 'УК' : LANGS[lang];
      if (state === 'locked') {
        return `<div class="line" data-state="locked">
          <span class="who" data-lang="${esc(l.lang)}" style="background:var(--line);color:var(--grey-3)">${esc(who)}</span>
          <span>${esc(t('scen.locked'))}</span>
        </div>`;
      }
      const sayText = l.uk;
      const gloss = l[lang] || l.en;
      return `<div class="line" data-state="${state}">
        <span class="who" data-lang="${esc(l.lang)}">${esc(who)}</span>
        <span class="body">
          <span class="uk">${esc(l.uk)}</span>
          <span class="tr">[${esc(l.tr)}]</span>
          ${gloss ? `<span class="en">${esc(gloss)}</span>` : ''}
          ${state === 'current' ? `<span class="acts">
            <button class="btn--ink" type="button" data-say="${esc(sayText)}">▶ Слухати · ${esc(t('scen.listen'))}</button>
            <button class="btn--ghost-ink" type="button" data-repeat>🎙 Повторити · ${esc(t('scen.repeat'))}</button>
          </span>` : ''}
        </span>
        ${state === 'done' ? `<button class="play" type="button" data-say="${esc(sayText)}" aria-label="Replay" style="margin-left:auto">▶</button>` : ''}
      </div>`;
    };

    const render = () => {
      const doneAll = at >= total;
      // Worked-through lines, the current one, and a single locked teaser.
      let html = scen.lines.slice(0, Math.min(at + 2, total)).map(lineHtml).join('');
      if (doneAll) {
        html += `<div class="line" data-state="current" style="flex-direction:column;align-items:stretch;gap:10px">
          <span style="font:700 19px var(--display)">Сценарій завершено ✓</span>
          <span style="font:600 14px var(--sans)">${esc(t('scen.done_body').replace('{n}', total))}</span>
          <span class="acts">
            <a class="btn--ink" href="${nextHref}" style="text-decoration:none">${esc(t('scen.next'))} ${esc(next.uk)} →</a>
            <button class="btn--ghost-ink" type="button" data-restart>↺ Спочатку · ${esc(t('scen.restart'))}</button>
          </span>
        </div>`;
      }
      scriptEl.innerHTML = html;
      const pct = Math.round((at / total) * 100);
      if (meterEl) meterEl.style.width = `${pct}%`;
      if (countEl) countEl.textContent = `${t('scen.lines_repeated')} · ${at} / ${total}`;
    };
    rerenders.push(render);

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

    const keyEl = $('#keyterms');
    if (keyEl && TERMS) {
      const renderKeys = () => {
        keyEl.innerHTML = scen.keyTerms
          .map((uk) => TERMS.find((tm) => tm.uk === uk))
          .filter(Boolean)
          .map((tm) => `<li><strong>${esc(tm.uk)}</strong> <span class="tr">[${esc(tm.tr)}]</span> — ${esc(tm[lang])}</li>`)
          .join('');
      };
      rerenders.push(renderKeys);
    }

    const drillEl = $('#drill-options');
    if (drillEl) {
      const verdict = $('#drill-verdict');
      const renderDrillQ = () => { $('#drill-q').textContent = scen.drill.q[lang]; };
      rerenders.push(renderDrillQ);
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
        verdict.textContent = right ? `Правильно · ${t('scen.correct')}` : `Ще раз · ${t('scen.tryagain')}`;
        if (right) play(btn.textContent.replace(' ✓', ''), null);
      });
    }
  }

  // First paint of everything language-dependent.
  rerenders.forEach((fn) => fn());
})();
