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
      'course.tag_done': 'DONE ✓', 'course.tag_continue': 'CONTINUE', 'course.steps': 'steps',
      'course.soon': 'SOON', 'course.radio': 'Radio comms', 'course.paper': 'Paperwork & HQ',
      'course.request': 'request a track →',
      'scen.pos': 'Scenario', 'scen.next': 'Next scenario:',
      'scen.scene': 'Scene', 'scen.steps_done': 'steps done',
      'scen.locked': 'the next step unlocks as you go…',
      'scen.done_body': 'All {n} steps completed. Well done.',
      'scen.scene_done': 'Scene complete. Keep going.',
      'scen.listen': 'Listen', 'scen.repeat': 'Repeat', 'scen.restart': 'Restart',
      'scen.continue': 'Continue', 'scen.next_scene': 'Next scene',
      'scen.keyterms': 'Key terms',
      'scen.correct': 'correct', 'scen.tryagain': 'try again',
      'scen.speak_prompt': 'Your turn — say it out loud',
      'scen.mic_listen': 'Speak', 'scen.mic_listening': 'Listening…',
      'scen.heard': 'We heard:',
      'scen.match_ok': 'Close enough — well done!',
      'scen.match_retry': 'Not quite — listen and try again, or continue',
      'scen.said_it': 'I said it — continue',
      'scen.mic_denied': 'Microphone unavailable — say it out loud and continue below',
      'scen.record': 'Record', 'scen.stop': 'Stop', 'scen.play_back': 'Play it back',
      'scen.sounded_right': 'Sounded right — continue',
      'scen.translate_prompt': 'Translate into your language — no copy-paste',
      'scen.translate_ph': 'Type your translation…',
      'scen.check': 'Check', 'scen.show_answer': 'Show the answer',
      'scen.answer_ok': 'Good translation!',
      'scen.answer_partial': 'Partly there — check the answer',
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
      'course.tag_done': 'HECHO ✓', 'course.tag_continue': 'CONTINUAR', 'course.steps': 'pasos',
      'course.soon': 'PRONTO', 'course.radio': 'Radiocomunicaciones', 'course.paper': 'Documentación y cuartel',
      'course.request': 'pide una pista →',
      'scen.pos': 'Escenario', 'scen.next': 'Siguiente escenario:',
      'scen.scene': 'Escena', 'scen.steps_done': 'pasos hechos',
      'scen.locked': 'el siguiente paso se desbloquea a medida que avanzas…',
      'scen.done_body': 'Los {n} pasos completados. ¡Bien hecho!',
      'scen.scene_done': 'Escena completada. Sigue.',
      'scen.listen': 'Escuchar', 'scen.repeat': 'Repetir', 'scen.restart': 'Desde el principio',
      'scen.continue': 'Continuar', 'scen.next_scene': 'Siguiente escena',
      'scen.keyterms': 'Palabras clave',
      'scen.correct': 'correcto', 'scen.tryagain': 'inténtalo otra vez',
      'scen.speak_prompt': 'Tu turno — dilo en voz alta',
      'scen.mic_listen': 'Hablar', 'scen.mic_listening': 'Escuchando…',
      'scen.heard': 'Hemos oído:',
      'scen.match_ok': 'Suficientemente cerca — ¡bien hecho!',
      'scen.match_retry': 'Casi — escucha e inténtalo otra vez, o continúa',
      'scen.said_it': 'Lo dije — continuar',
      'scen.mic_denied': 'Micrófono no disponible — dilo en voz alta y continúa abajo',
      'scen.record': 'Grabar', 'scen.stop': 'Parar', 'scen.play_back': 'Escúchate',
      'scen.sounded_right': 'Sonó bien — continuar',
      'scen.translate_prompt': 'Traduce a tu idioma — sin copiar y pegar',
      'scen.translate_ph': 'Escribe tu traducción…',
      'scen.check': 'Comprobar', 'scen.show_answer': 'Ver la respuesta',
      'scen.answer_ok': '¡Buena traducción!',
      'scen.answer_partial': 'Casi — mira la respuesta',
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
      'course.tag_done': 'FEITO ✓', 'course.tag_continue': 'CONTINUAR', 'course.steps': 'passos',
      'course.soon': 'EM BREVE', 'course.radio': 'Comunicações de rádio', 'course.paper': 'Documentação e QG',
      'course.request': 'peça uma trilha →',
      'scen.pos': 'Cenário', 'scen.next': 'Próximo cenário:',
      'scen.scene': 'Cena', 'scen.steps_done': 'passos feitos',
      'scen.locked': 'o próximo passo desbloqueia conforme você avança…',
      'scen.done_body': 'Todos os {n} passos concluídos. Muito bem!',
      'scen.scene_done': 'Cena concluída. Continue.',
      'scen.listen': 'Ouvir', 'scen.repeat': 'Repetir', 'scen.restart': 'Do início',
      'scen.continue': 'Continuar', 'scen.next_scene': 'Próxima cena',
      'scen.keyterms': 'Palavras-chave',
      'scen.correct': 'correto', 'scen.tryagain': 'tente de novo',
      'scen.speak_prompt': 'Sua vez — diga em voz alta',
      'scen.mic_listen': 'Falar', 'scen.mic_listening': 'Ouvindo…',
      'scen.heard': 'Ouvimos:',
      'scen.match_ok': 'Perto o suficiente — muito bem!',
      'scen.match_retry': 'Quase — ouça e tente de novo, ou continue',
      'scen.said_it': 'Eu disse — continuar',
      'scen.mic_denied': 'Microfone indisponível — diga em voz alta e continue abaixo',
      'scen.record': 'Gravar', 'scen.stop': 'Parar', 'scen.play_back': 'Ouça você mesmo',
      'scen.sounded_right': 'Soou bem — continuar',
      'scen.translate_prompt': 'Traduza para o seu idioma — sem copiar e colar',
      'scen.translate_ph': 'Digite sua tradução…',
      'scen.check': 'Verificar', 'scen.show_answer': 'Ver a resposta',
      'scen.answer_ok': 'Boa tradução!',
      'scen.answer_partial': 'Quase lá — veja a resposta',
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
    // Manifest values are `{ file, provider, at }` (v2) or a bare filename (v1).
    const entry = audioManifest[text];
    const file = entry && (typeof entry === 'string' ? entry : entry.file);
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

  /* ── Journey progress ──────────────────────────────────────
     Stored per scene as `pk-j-<journeyId>-<sceneId>` → steps completed.
     Older builds kept one `pk-scen-<trackNo>` count of scene-1 lines; migrate
     it into the first scene of that track's first journey. (The converted
     scenarios grew by one step — the old drill is now an inline choice — so a
     previously "done" user lands one step short. Acceptable.) */
  const jKey = (journey, scene) => `pk-j-${journey.id}-${scene.id}`;
  const sceneDone = (journey, scene) =>
    Math.min(parseInt(localStorage.getItem(jKey(journey, scene)) || '0', 10) || 0, scene.steps.length);
  if (SCENARIOS) {
    for (const journey of SCENARIOS) {
      const old = localStorage.getItem(`pk-scen-${journey.track}`);
      if (old === null) continue;
      const first = journey.scenes[0];
      if (localStorage.getItem(jKey(journey, first)) === null) {
        const n = Math.min(parseInt(old, 10) || 0, first.steps.length);
        localStorage.setItem(jKey(journey, first), String(n));
      }
      localStorage.removeItem(`pk-scen-${journey.track}`);
    }
  }

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
        // Real progress: steps completed across every scene of every journey
        // in this track (same localStorage the scenario page writes).
        const journeys = SCENARIOS.filter((x) => x.track === tk.no);
        let total = 0, done = 0;
        for (const j of journeys) for (const sc of j.scenes) {
          total += sc.steps.length;
          done += sceneDone(j, sc);
        }
        const pct = total ? Math.round((done / total) * 100) : 0;
        const tag = tk.tag
          + (tk.tagNote ? ` · ${tk.tagNote[lang]}` : '')
          + (done >= total ? ` · ${t('course.tag_done')}` : done ? ` · ${t('course.tag_continue')}` : '');
        const cta = done >= total ? `Ще раз · ${t('course.again')}` : done ? `Продовжити · ${t('course.continue')}` : `Почати · ${t('course.start')}`;
        return `<a class="ticket track ${s.cls} tilt-${(i % 4) + 1}" href="/scenario?j=${esc(journeys[0].id)}">
          <span class="top"><span class="no" style="color:${s.no}">${esc(tag)}</span><span class="lvl" style="color:${s.lvl}">${esc(tk.level)}</span></span>
          <h2>${esc(tk.uk)}<br>${esc(tk[lang])}</h2>
          <p>${esc(tk.desc[lang])}</p>
          <span class="progress">
            <span class="bar" style="background:${s.bar}"><i style="width:${pct}%;background:${s.fill}"></i></span>
            <span class="n">${done}/${total} ${esc(t('course.steps'))}</span>
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
    const params = new URLSearchParams(location.search);
    const journey =
      SCENARIOS.find((s) => s.id === params.get('j')) ||
      SCENARIOS.find((s) => s.track === params.get('track')) ||
      SCENARIOS.find((s) => s.track === '03');
    const next = SCENARIOS[(SCENARIOS.indexOf(journey) + 1) % SCENARIOS.length];
    const nextHref = `/scenario?j=${next.id}`;
    const scenes = journey.scenes;
    const grandTotal = scenes.reduce((n, sc) => n + sc.steps.length, 0);

    // Resume at the first unfinished scene.
    let sceneIdx = scenes.findIndex((sc) => sceneDone(journey, sc) < sc.steps.length);
    if (sceneIdx < 0) sceneIdx = scenes.length - 1;
    let scene = scenes[sceneIdx];
    let at = sceneDone(journey, scene);

    /* Transient state of the current step; cleared on every advance. */
    const speak = { status: 'idle', heard: '', ok: false };
    const trans = { value: '', verdict: '', revealed: false, graded: false };
    let recog = null, recorder = null, recUrl = null;
    let micDenied = false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    // sr → recognition + fuzzy match; rec → record-and-listen self-check;
    // honor → prompt only. Downgrades on missing APIs or denied permission.
    let micMode = SR ? 'sr'
      : navigator.mediaDevices?.getUserMedia && window.MediaRecorder ? 'rec' : 'honor';

    const stopMic = () => {
      try { recog?.abort(); } catch { /* already stopped */ }
      recog = null;
      if (recorder && recorder.state === 'recording') recorder.stop();
    };
    const resetStep = () => {
      stopMic();
      Object.assign(speak, { status: 'idle', heard: '', ok: false });
      Object.assign(trans, { value: '', verdict: '', revealed: false, graded: false });
      if (recUrl) { URL.revokeObjectURL(recUrl); recUrl = null; }
      recorder = null;
    };

    /* Lenient similarity for speech: character-bigram Dice coefficient over
       normalized text. Word-order and length tolerant; 0.55 is deliberately
       forgiving — recognition of accented Ukrainian is noisy and the goal is
       encouragement, not assessment. `norm` also powers translate grading. */
    const norm = (s) => String(s).toLowerCase()
      .replace(/[’'`]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const bigrams = (s) => {
      const m = new Map();
      for (let i = 0; i < s.length - 1; i++) { const b = s.slice(i, i + 2); m.set(b, (m.get(b) || 0) + 1); }
      return m;
    };
    const dice = (a, b) => {
      const A = bigrams(norm(a)), B = bigrams(norm(b));
      let inter = 0, nA = 0, nB = 0;
      for (const v of A.values()) nA += v;
      for (const v of B.values()) nB += v;
      for (const [k, v] of A) inter += Math.min(v, B.get(k) || 0);
      return nA + nB ? (2 * inter) / (nA + nB) : 0;
    };
    const MATCH = 0.55;

    // Head — position is the journey's real index; the kicker adds the scene.
    const pos = String(SCENARIOS.indexOf(journey) + 1).padStart(2, '0');
    const renderHead = () => {
      const sc = scenes[sceneIdx];
      document.title = `${journey.uk} · ${journey[lang]} — Сценарій ${pos} — Перший Крок`;
      $('#scen-kicker').textContent =
        `${t('scen.pos')} ${pos} / ${String(SCENARIOS.length).padStart(2, '0')} · ${journey.category[lang]}`
        + (scenes.length > 1 ? ` — ${t('scen.scene')} ${sceneIdx + 1}/${scenes.length} · ${sc[lang]}` : '');
      $('#scen-title').innerHTML = `${esc(journey.uk)}<br><span class="hl">${esc(journey[lang])}</span>`;
      const nextLink = $('#next-scen');
      nextLink.href = nextHref;
      nextLink.textContent = `${t('scen.next')} ${next.uk} →`;
    };
    rerenders.push(renderHead);

    const meterEl = $('#meter');
    const countEl = $('#phrase-count');

    /* One HTML builder per step type. All reuse the .line done/current/locked
       visual states; `who` badges: УК/EN for dialogue, § ? ✎ for the rest. */

    const doneBits = (step) => {
      switch (step.type) {
        case 'line':
        case 'speak':
          return { who: step.type === 'line' && step.lang === 'УК' ? 'УК' : LANGS[lang],
            lang: step.type === 'line' ? step.lang : 'EN',
            body: `<span class="uk">${esc(step.uk)}</span><span class="tr">[${esc(step.tr)}]</span>`,
            say: step.uk };
        case 'choice': {
          const right = step.options.find((o) => o.right);
          return { who: '?', lang: 'EN',
            body: `<span class="en">${esc(step.q[lang] || step.q.en)}</span><span class="uk" style="font-size:16px">${esc(right?.label || '')} ✓</span>`,
            say: right && /[Ѐ-ӿ]/.test(right.label) ? right.label : null };
        }
        case 'translate':
          return { who: '✎', lang: 'EN',
            body: `<span class="uk" style="font-size:16px">${esc(step.uk)}</span><span class="en">${esc(step.model[lang] || step.model.en)}</span>`,
            say: step.uk };
        case 'info':
          return { who: '§', lang: null,
            body: `<span class="en" style="font-weight:700">${esc(step.title[lang] || step.title.en)}</span>`, say: null };
        default:
          return { who: '·', lang: null, body: '', say: null };
      }
    };

    const speakActs = (step) => {
      const listen = `<button class="btn--ink" type="button" data-say="${esc(step.uk)}">▶ Слухати · ${esc(t('scen.listen'))}</button>`;
      const skip = `<button class="btn--ghost-ink" type="button" data-repeat>Готово · ${esc(t('scen.said_it'))}</button>`;
      let mid = '', extra = '';
      if (micMode === 'sr') {
        mid = speak.status === 'listening'
          ? `<button class="btn--ghost-ink" type="button" data-mic>● ${esc(t('scen.mic_listening'))}</button>`
          : `<button class="btn--ghost-ink" type="button" data-mic>🎙 Говорити · ${esc(t('scen.mic_listen'))}</button>`;
        if (speak.status === 'heard') {
          extra = `<span class="step-heard">${esc(t('scen.heard'))} «${esc(speak.heard)}»</span>
            <span class="step-verdict">${speak.ok ? `Правильно · ${esc(t('scen.match_ok'))}` : `Ще раз · ${esc(t('scen.match_retry'))}`}</span>`;
        }
      } else if (micMode === 'rec') {
        mid = speak.status === 'recording'
          ? `<button class="btn--ghost-ink" type="button" data-mic>■ Стоп · ${esc(t('scen.stop'))}</button>`
          : `<button class="btn--ghost-ink" type="button" data-mic>🎙 Запис · ${esc(t('scen.record'))}</button>`;
        if (speak.status === 'recorded' && recUrl) {
          extra = `<span class="acts">
            <button class="btn--ghost-ink" type="button" data-playrec>▶ Прослухати · ${esc(t('scen.play_back'))}</button>
            <button class="btn--ink" type="button" data-repeat>Готово · ${esc(t('scen.sounded_right'))}</button>
          </span>`;
        }
      } else if (micDenied) {
        extra = `<span class="step-verdict">${esc(t('scen.mic_denied'))}</span>`;
      }
      return `${extra}<span class="acts">${listen}${mid}${micMode === 'rec' && speak.status === 'recorded' ? '' : skip}</span>`;
    };

    const currentHtml = (step) => {
      const gloss = step[lang] || step.en;
      switch (step.type) {
        case 'line':
          return `<span class="who" data-lang="${esc(step.lang)}">${esc(step.lang === 'УК' ? 'УК' : LANGS[lang])}</span>
            <span class="body">
              <span class="uk">${esc(step.uk)}</span>
              <span class="tr">[${esc(step.tr)}]</span>
              ${gloss ? `<span class="en">${esc(gloss)}</span>` : ''}
              <span class="acts">
                <button class="btn--ink" type="button" data-say="${esc(step.uk)}">▶ Слухати · ${esc(t('scen.listen'))}</button>
                <button class="btn--ghost-ink" type="button" data-repeat>🎙 Повторити · ${esc(t('scen.repeat'))}</button>
              </span>
            </span>`;
        case 'speak':
          return `<span class="who" data-lang="EN">${esc(LANGS[lang])}</span>
            <span class="body">
              <span class="tr">🎙 ${esc(t('scen.speak_prompt'))}</span>
              <span class="uk">${esc(step.uk)}</span>
              <span class="tr">[${esc(step.tr)}]</span>
              ${gloss ? `<span class="en">${esc(gloss)}</span>` : ''}
              ${speakActs(step)}
            </span>`;
        case 'choice':
          return `<span class="who" data-lang="EN">?</span>
            <span class="body">
              <span class="en" style="font-weight:700">${esc(step.q[lang] || step.q.en)}</span>
              <span class="step-choice">${step.options
                .map((o, k) => `<button type="button" data-choice="${k}" data-right="${o.right ? 'true' : 'false'}">${esc(o.label)}</button>`)
                .join('')}</span>
              <span class="step-verdict" data-verdict></span>
            </span>`;
        case 'translate':
          return `<span class="who" data-lang="EN">✎</span>
            <span class="body">
              <span class="tr">✎ ${esc(t('scen.translate_prompt'))}</span>
              <span class="uk">${esc(step.uk)}</span>
              <span class="tr">[${esc(step.tr)}]</span>
              <textarea data-translate-input autocomplete="off" autocapitalize="off" spellcheck="false"
                placeholder="${esc(t('scen.translate_ph'))}"></textarea>
              <span class="step-verdict">${trans.graded
                ? (trans.verdict === 'ok' ? `Правильно · ${esc(t('scen.answer_ok'))}` : `Майже · ${esc(t('scen.answer_partial'))}`)
                : ''}</span>
              ${trans.revealed ? `<span class="step-model">«${esc(step.uk)}» — ${esc(step.model[lang] || step.model.en)}</span>` : ''}
              <span class="acts">
                <button class="btn--ink" type="button" data-check>Перевірити · ${esc(t('scen.check'))}</button>
                ${trans.graded && !trans.revealed ? `<button class="btn--ghost-ink" type="button" data-reveal>Відповідь · ${esc(t('scen.show_answer'))}</button>` : ''}
                ${trans.graded ? `<button class="btn--ghost-ink" type="button" data-repeat>Далі · ${esc(t('scen.continue'))}</button>` : ''}
              </span>
            </span>`;
        case 'info':
          return `<span class="who">§</span>
            <span class="body">
              <span class="uk" style="font-size:17px">${esc(step.title[lang] || step.title.en)}</span>
              <span class="en">${esc(step.body[lang] || step.body.en)}</span>
              <span class="acts">
                <button class="btn--ink" type="button" data-repeat>Далі · ${esc(t('scen.continue'))}</button>
              </span>
            </span>`;
        default:
          return '';
      }
    };

    const stepHtml = (step, i) => {
      const state = i < at ? 'done' : i === at ? 'current' : 'locked';
      if (state === 'locked') {
        return `<div class="line" data-state="locked">
          <span class="who" style="background:var(--line);color:var(--grey-3)">•</span>
          <span>${esc(t('scen.locked'))}</span>
        </div>`;
      }
      if (state === 'current') return `<div class="line" data-state="current">${currentHtml(step)}</div>`;
      const d = doneBits(step);
      return `<div class="line" data-state="done">
        <span class="who"${d.lang ? ` data-lang="${esc(d.lang)}"` : ''}>${esc(d.who)}</span>
        <span class="body">${d.body}</span>
        ${d.say ? `<button class="play" type="button" data-say="${esc(d.say)}" aria-label="Replay" style="margin-left:auto">▶</button>` : ''}
      </div>`;
    };

    const render = () => {
      const total = scene.steps.length;
      // Worked-through steps, the current one, and a single locked teaser.
      let html = scene.steps.slice(0, Math.min(at + 2, total)).map(stepHtml).join('');
      if (at >= total) {
        const lastScene = sceneIdx >= scenes.length - 1;
        html += lastScene
          ? `<div class="line" data-state="current" style="flex-direction:column;align-items:stretch;gap:10px">
              <span style="font:700 19px var(--display)">Сценарій завершено ✓</span>
              <span style="font:600 14px var(--sans)">${esc(t('scen.done_body').replace('{n}', grandTotal))}</span>
              <span class="acts">
                <a class="btn--ink" href="${nextHref}" style="text-decoration:none">${esc(t('scen.next'))} ${esc(next.uk)} →</a>
                <button class="btn--ghost-ink" type="button" data-restart>↺ Спочатку · ${esc(t('scen.restart'))}</button>
              </span>
            </div>`
          : `<div class="line" data-state="current" style="flex-direction:column;align-items:stretch;gap:10px">
              <span style="font:700 19px var(--display)">Сцену завершено ✓</span>
              <span style="font:600 14px var(--sans)">${esc(t('scen.scene_done'))}</span>
              <span class="acts">
                <button class="btn--ink" type="button" data-next-scene>${esc(t('scen.next_scene'))}: ${esc(scenes[sceneIdx + 1].uk)} →</button>
              </span>
            </div>`;
      }
      scriptEl.innerHTML = html;
      // innerHTML can't carry the draft translation — restore it.
      const ta = $('[data-translate-input]', scriptEl);
      if (ta) ta.value = trans.value;
      const doneSum = scenes.reduce((n, sc) => n + sceneDone(journey, sc), 0);
      const pct = Math.round((doneSum / grandTotal) * 100);
      if (meterEl) meterEl.style.width = `${pct}%`;
      if (countEl) countEl.textContent = `${t('scen.steps_done')} · ${doneSum} / ${grandTotal}`;
    };
    rerenders.push(render);

    const advance = () => {
      resetStep();
      at = Math.min(at + 1, scene.steps.length);
      localStorage.setItem(jKey(journey, scene), String(at));
      render();
      $('.line[data-state="current"]', scriptEl)?.scrollIntoView({ block: 'nearest' });
    };

    /* Speech recognition (Chrome/Edge/Safari). Firefox has no SR: micMode
       falls back to record-and-listen, and if even that fails, to the honor
       button. The skip button stays visible in every mode — recognition can
       never hard-block progress. */
    const startSR = (step) => {
      if (currentAudio) currentAudio.pause();
      window.speechSynthesis?.cancel();
      recog = new SR();
      recog.lang = 'uk-UA';
      recog.interimResults = false;
      recog.maxAlternatives = 3;
      let got = false;
      recog.onresult = (e) => {
        got = true;
        let best = { text: '', score: 0 };
        for (const alt of e.results[0]) {
          const score = dice(alt.transcript, step.uk);
          if (score >= best.score) best = { text: alt.transcript, score };
        }
        Object.assign(speak, { status: 'heard', heard: best.text, ok: best.score >= MATCH });
        render();
        if (speak.ok) setTimeout(advance, 600);
      };
      recog.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          micMode = 'honor';
          micDenied = true;
        }
        if (speak.status === 'listening') speak.status = 'idle';
        render();
      };
      recog.onend = () => {
        if (!got && speak.status === 'listening') { speak.status = 'idle'; render(); }
      };
      speak.status = 'listening';
      render();
      try { recog.start(); } catch { speak.status = 'idle'; render(); }
    };

    const startRec = async () => {
      if (currentAudio) currentAudio.pause();
      window.speechSynthesis?.cancel();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          stream.getTracks().forEach((tk) => tk.stop());
          if (recUrl) URL.revokeObjectURL(recUrl);
          recUrl = URL.createObjectURL(new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' }));
          recorder = null;
          speak.status = 'recorded';
          render();
        };
        recorder.start();
        speak.status = 'recording';
        render();
        setTimeout(() => { if (recorder && recorder.state === 'recording') recorder.stop(); }, 4000);
      } catch {
        micMode = 'honor';
        micDenied = true;
        speak.status = 'idle';
        render();
      }
    };

    scriptEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-restart]')) {
        resetStep();
        for (const sc of scenes) localStorage.removeItem(jKey(journey, sc));
        sceneIdx = 0;
        scene = scenes[0];
        at = 0;
        renderHead();
        render();
        return;
      }
      if (e.target.closest('[data-next-scene]')) {
        resetStep();
        sceneIdx = Math.min(sceneIdx + 1, scenes.length - 1);
        scene = scenes[sceneIdx];
        at = sceneDone(journey, scene);
        renderHead();
        render();
        scriptEl.scrollIntoView({ block: 'start' });
        return;
      }
      const pick = e.target.closest('[data-choice]');
      if (pick) {
        const right = pick.dataset.right === 'true';
        $$('[data-choice]', scriptEl).forEach((b) => delete b.dataset.picked);
        pick.dataset.picked = 'true';
        const v = $('[data-verdict]', scriptEl);
        if (v) v.textContent = right ? `Правильно · ${t('scen.correct')}` : `Ще раз · ${t('scen.tryagain')}`;
        if (right) {
          $$('[data-choice]', scriptEl).forEach((b) => { b.disabled = true; });
          // Only Cyrillic labels are Ukrainian phrases with audio (digits/times are not).
          if (/[Ѐ-ӿ]/.test(pick.textContent)) play(pick.textContent, null);
          setTimeout(advance, 700);
        }
        return;
      }
      if (e.target.closest('[data-check]')) {
        const step = scene.steps[at];
        if (!step || step.type !== 'translate') return;
        const concepts = step.keywords[lang] || step.keywords.en || [];
        const ans = norm(trans.value);
        const hit = concepts.filter((syns) => syns.some((k) => ans.includes(norm(k)))).length;
        trans.graded = true;
        trans.verdict = concepts.length && hit / concepts.length >= 0.6 ? 'ok' : 'partial';
        render();
        return;
      }
      if (e.target.closest('[data-reveal]')) {
        trans.revealed = true;
        render();
        return;
      }
      if (e.target.closest('[data-mic]')) {
        const step = scene.steps[at];
        if (!step || step.type !== 'speak') return;
        if (micMode === 'sr') {
          if (speak.status === 'listening') { stopMic(); speak.status = 'idle'; render(); }
          else startSR(step);
        } else if (micMode === 'rec') {
          if (recorder && recorder.state === 'recording') recorder.stop();
          else startRec();
        }
        return;
      }
      if (e.target.closest('[data-playrec]')) {
        if (recUrl) { if (currentAudio) currentAudio.pause(); new Audio(recUrl).play().catch(() => {}); }
        return;
      }
      if (!e.target.closest('[data-repeat]')) return;
      advance();
    });

    // No copy-paste into translations — that's the point. Draft survives
    // re-renders via `trans.value` (listeners here, since innerHTML rebuilds).
    scriptEl.addEventListener('paste', (e) => { if (e.target.closest('[data-translate-input]')) e.preventDefault(); });
    scriptEl.addEventListener('drop', (e) => { if (e.target.closest('[data-translate-input]')) e.preventDefault(); });
    scriptEl.addEventListener('input', (e) => {
      const ta = e.target.closest('[data-translate-input]');
      if (ta) trans.value = ta.value;
    });

    const keyEl = $('#keyterms');
    if (keyEl && TERMS) {
      const renderKeys = () => {
        keyEl.innerHTML = journey.keyTerms
          .map((uk) => TERMS.find((tm) => tm.uk === uk))
          .filter(Boolean)
          .map((tm) => `<li><strong>${esc(tm.uk)}</strong> <span class="tr">[${esc(tm.tr)}]</span> — ${esc(tm[lang])}</li>`)
          .join('');
      };
      rerenders.push(renderKeys);
    }
  }

  // First paint of everything language-dependent.
  rerenders.forEach((fn) => fn());
})();
