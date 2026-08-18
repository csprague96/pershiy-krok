/* Content for Перший Крок. Rows are compact tuples:
   [uk, translit, en, es, pt, section, exampleUk?, exampleEn?] */
(function () {
  const SECTIONS = [
    { id: '01', uk: 'Звання', en: 'Ranks & forms of address' },
    { id: '02', uk: 'Команди', en: 'Commands & drill language' },
    { id: '03', uk: 'Медицина', en: 'Medical & casualty terms' },
    { id: '04', uk: 'Спорядження', en: 'Gear & equipment' },
    { id: '05', uk: 'Напрямки', en: 'Directions & distance' },
    { id: '06', uk: 'Документи', en: 'Reporting & paperwork' },
    { id: '07', uk: 'Побут', en: 'Daily life in a unit' },
  ];

  const ROWS = [
    ['солдат', 'soldat', 'soldier', 'soldado', 'soldado', '01'],
    ['сержант', 'serzhant', 'sergeant', 'sargento', 'sargento', '01'],
    ['старший сержант', 'starshyi serzhant', 'senior sergeant', 'sargento primero', 'primeiro-sargento', '01'],
    ['лейтенант', 'leitenant', 'lieutenant', 'teniente', 'tenente', '01'],
    ['капітан', 'kapitan', 'captain', 'capitán', 'capitão', '01'],
    ['командир', 'komandyr', 'commander', 'comandante', 'comandante', '01', 'Де командир?', 'Where is the commander?'],
    ['побратим', 'pobratym', 'brother-in-arms', 'hermano de armas', 'irmão de armas', '01'],

    ['Стій!', 'stii', 'Halt! / Stop!', '¡Alto!', 'Alto!', '02'],
    ['Лягай!', 'liahai', 'Get down!', '¡Al suelo!', 'Ao chão!', '02'],
    ['Вперед!', 'vpered', 'Forward! / Move!', '¡Adelante!', 'Avançar!', '02'],
    ['В укриття!', 'v ukryttia', 'Take cover!', '¡A cubierto!', 'Abriguem-se!', '02', '«В укриття!»', '“Take cover!”'],
    ['Вогонь!', 'vohon', 'Fire!', '¡Fuego!', 'Fogo!', '02'],
    ['Не стріляти!', 'ne striliaty', "Don't shoot!", '¡No disparen!', 'Não atirem!', '02'],
    ['Зрозумів.', 'zrozumiv', 'Understood.', 'Entendido.', 'Entendido.', '02'],
    ['Повторіть.', 'povtorit', 'Say again.', 'Repita.', 'Repita.', '02'],
    ['Швидше!', 'shvydshe', 'Faster!', '¡Más rápido!', 'Mais rápido!', '02'],
    ['Тримай позицію!', 'trymai pozytsiiu', 'Hold the position!', '¡Mantén la posición!', 'Mantenha a posição!', '02'],
    ['Готовий?', 'hotovyi', 'Ready?', '¿Listo?', 'Pronto?', '02'],

    ['поранений', 'poranenyi', 'casualty / wounded', 'herido', 'ferido', '03', 'Маємо пораненого!', 'We have a casualty!'],
    ['медик', 'medyk', 'medic', 'sanitario', 'socorrista', '03', 'Потрібен медик!', 'We need a medic!'],
    ['джгут', 'dzhhut', 'tourniquet', 'torniquete', 'torniquete', '03', 'Наклади джгут!', 'Apply a tourniquet!'],
    ['допомога', 'dopomoha', 'help / aid', 'ayuda', 'ajuda', '03'],
    ['евакуація', 'evakuatsiia', 'evacuation', 'evacuación', 'evacuação', '03'],
    ['кровотеча', 'krovotecha', 'bleeding', 'hemorragia', 'hemorragia', '03'],
    ['ноші', 'noshi', 'stretcher', 'camilla', 'maca', '03'],
    ['нога', 'noha', 'leg', 'pierna', 'perna', '03'],
    ['рука', 'ruka', 'arm / hand', 'brazo', 'braço', '03'],
    ['дихає', 'dykhaie', 'breathing (he/she is)', 'respira', 'respira', '03'],

    ['зброя', 'zbroia', 'weapon', 'arma', 'arma', '04', 'Зброю на землю!', 'Weapon on the ground!'],
    ['набої', 'naboi', 'rounds / ammo', 'munición', 'munição', '04'],
    ['магазин', 'mahazyn', 'magazine', 'cargador', 'carregador', '04'],
    ['шолом', 'sholom', 'helmet', 'casco', 'capacete', '04'],
    ['бронежилет', 'bronezhylet', 'body armour', 'chaleco antibalas', 'colete balístico', '04'],
    ['рація', 'ratsiia', 'radio', 'radio', 'rádio', '04'],
    ['дрон', 'dron', 'drone / UAV', 'dron', 'drone', '04'],
    ['дим', 'dym', 'smoke', 'humo', 'fumaça', '04'],
    ['ліхтар', 'likhtar', 'torch / flashlight', 'linterna', 'lanterna', '04'],

    ['ліворуч', 'livoruch', 'to the left', 'a la izquierda', 'à esquerda', '05'],
    ['праворуч', 'pravoruch', 'to the right', 'a la derecha', 'à direita', '05'],
    ['прямо', 'priamo', 'straight ahead', 'todo recto', 'em frente', '05'],
    ['назад', 'nazad', 'back', 'atrás', 'para trás', '05'],
    ['північ', 'pivnich', 'north', 'norte', 'norte', '05'],
    ['двісті метрів', 'dvisti metriv', 'two hundred metres', 'doscientos metros', 'duzentos metros', '05'],
    ['поруч', 'poruch', 'nearby', 'cerca', 'perto', '05'],

    ['доповідаю', 'dopovidaiu', 'reporting (I report)', 'informo', 'reporto', '06'],
    ['наказ', 'nakaz', 'order', 'orden', 'ordem', '06'],
    ['позивний', 'pozyvnyi', 'call sign', 'indicativo', 'indicativo', '06'],
    ['посвідчення', 'posvidchennia', 'ID card', 'identificación', 'identificação', '06'],
    ['час', 'chas', 'time', 'hora', 'hora', '06'],

    ['вода', 'voda', 'water', 'agua', 'água', '07'],
    ['їжа', 'yizha', 'food', 'comida', 'comida', '07'],
    ['спати', 'spaty', 'to sleep', 'dormir', 'dormir', '07'],
    ['холодно', 'kholodno', 'cold (it is)', 'hace frío', 'está frio', '07'],
    ['укриття', 'ukryttia', 'shelter / cover', 'refugio', 'abrigo', '07'],
    ['дякую', 'diakuiu', 'thank you', 'gracias', 'obrigado', '07'],
    ['будь ласка', 'bud laska', 'please / you’re welcome', 'por favor', 'por favor', '07'],
  ];

  const TERMS = ROWS.map(([uk, tr, en, es, pt, sec, exUk, exEn]) => ({
    uk, tr, en, es, pt, sec,
    example: exUk ? { uk: exUk, en: exEn } : null,
    letter: uk[0].toUpperCase(),
  }));

  const TRACKS = [
    {
      no: '01', level: 'A0 → A1', uk: 'Перший тиждень', en: 'First week in a unit',
      desc: 'Greetings, ranks, forms of address, yes/no/understood, basic needs. Day one survival language.',
      done: 9, total: 20, tone: 'yellow', tag: 'ТРЕК 01 · CONTINUE',
    },
    {
      no: '02', level: 'A1', uk: 'На полігоні', en: 'On the training ground',
      desc: 'Drill commands, weapons handling vocabulary, safety calls, directions and distances.',
      done: 0, total: 16, tone: 'cream', tag: 'ТРЕК 02',
    },
    {
      no: '03', level: 'A1 → A2', uk: 'Медична мова', en: 'Medical language',
      desc: 'Casualty calls, MARCH vocabulary, body parts, evacuation phrases. For medics and everyone else.',
      done: 2, total: 17, tone: 'cream', tag: 'ТРЕК 03',
    },
    {
      no: '04', level: 'B1', uk: 'Мова інструктора', en: "Instructor's toolkit",
      desc: 'Teaching through an interpreter, giving corrections, classroom + range instructions in Ukrainian.',
      done: 0, total: 12, tone: 'blue', tag: 'ТРЕК 04 · FOR INSTRUCTORS',
    },
  ];

  const SCENARIOS = [
    {
      track: '01', no: '01', of: '38', category: 'FIRST WEEK',
      uk: 'Знайомство.', en: 'Introductions.',
      lines: [
        { lang: 'УК', uk: 'Я — сержант Андрій. Позивний «Сокіл».', tr: 'ya — serzhant andrii. pozyvnyi "sokil"', en: 'I am sergeant Andrii. Call sign "Sokil".' },
        { lang: 'EN', uk: 'Nice to meet you. I am a volunteer.', tr: 'Дуже приємно. Я — доброволець. [duzhe pryiemno. ya — dobrovolets]', en: '' },
        { lang: 'УК', uk: 'Зрозумів. Говориш українською?', tr: 'zrozumiv. hovorysh ukrainskoiu?', en: 'Understood. Do you speak Ukrainian?' },
        { lang: 'EN', uk: 'A little. Slowly, please.', tr: 'Трохи. Повільно, будь ласка. [trokhy. povilno, bud laska]', en: '' },
        { lang: 'УК', uk: 'Добре. Дякую, побратиме!', tr: 'dobre. diakuiu, pobratyme!', en: 'Good. Thank you, brother!' },
      ],
      keyTerms: ['сержант', 'позивний', 'будь ласка', 'дякую'],
      drill: {
        q: 'How do you say “thank you”?',
        options: [
          { label: 'дякую', right: true },
          { label: 'вода', right: false },
          { label: 'наказ', right: false },
        ],
      },
    },
    {
      track: '02', no: '04', of: '38', category: 'TRAINING GROUND',
      uk: 'На стрільбищі.', en: 'On the range.',
      lines: [
        { lang: 'УК', uk: 'Зброю на землю! Магазин від’єднати!', tr: 'zbroiu na zemliu! mahazyn vidiednaty!', en: 'Weapon on the ground! Detach the magazine!' },
        { lang: 'EN', uk: 'Magazine off. Weapon is clear.', tr: 'Магазин знято. Зброя розряджена. [mahazyn zniato. zbroia rozriadzhena]', en: '' },
        { lang: 'УК', uk: 'Готовий? Набої — двадцять.', tr: 'hotovyi? naboi — dvadtsiat', en: 'Ready? Twenty rounds.' },
        { lang: 'УК', uk: 'Вогонь!', tr: 'vohon!', en: 'Fire!' },
        { lang: 'УК', uk: 'Стій! Не стріляти!', tr: 'stii! ne striliaty!', en: 'Halt! Cease fire!' },
      ],
      keyTerms: ['зброя', 'магазин', 'набої', 'Вогонь!'],
      drill: {
        q: 'How do you shout “Fire!”?',
        options: [
          { label: 'Стій!', right: false },
          { label: 'Вогонь!', right: true },
          { label: 'Лягай!', right: false },
        ],
      },
    },
    {
      track: '03', no: '07', of: '38', category: 'MEDICAL',
      uk: 'Поранений.', en: 'Casualty.',
      lines: [
        { lang: 'УК', uk: 'Маємо пораненого! Потрібен медик!', tr: 'maiemo poranenoho! potriben medyk!', en: 'We have a casualty! We need a medic!' },
        { lang: 'EN', uk: 'Where is he hit?', tr: 'Куди його поранено? [kudy yoho poraneno?]', en: '' },
        { lang: 'УК', uk: 'Нога. Наклади джгут!', tr: 'noha. naklady dzhhut!', en: 'The leg. Apply a tourniquet!' },
        { lang: 'EN', uk: 'Tourniquet on. Calling for evacuation.', tr: 'Джгут накладено. Викликаю евакуацію.', en: '' },
        { lang: 'УК', uk: 'Ноші сюди! Швидше!', tr: 'noshi siudy! shvydshe!', en: 'Stretcher over here! Faster!' },
      ],
      keyTerms: ['поранений', 'медик', 'джгут', 'нога'],
      drill: {
        q: 'How do you shout “tourniquet”?',
        options: [
          { label: 'укриття', right: false },
          { label: 'джгут', right: true },
          { label: 'звання', right: false },
        ],
      },
    },
    {
      track: '04', no: '12', of: '38', category: 'INSTRUCTOR',
      uk: 'Перше заняття.', en: 'First class.',
      lines: [
        { lang: 'УК', uk: 'Слухай наказ. Повторюй за мною.', tr: 'slukhai nakaz. povtoriui za mnoiu', en: 'Listen to the order. Repeat after me.' },
        { lang: 'EN', uk: 'Understood. Say again, please.', tr: 'Зрозумів. Повторіть, будь ласка. [zrozumiv. povtorit, bud laska]', en: '' },
        { lang: 'УК', uk: 'Повільно. Ще раз. Швидше!', tr: 'povilno. shche raz. shvydshe!', en: 'Slowly. Once more. Faster!' },
        { lang: 'УК', uk: 'Добре. Час — п’ять хвилин. Готовий?', tr: 'dobre. chas — piat khvylyn. hotovyi?', en: 'Good. Five minutes. Ready?' },
      ],
      keyTerms: ['наказ', 'Повторіть.', 'час', 'Готовий?'],
      drill: {
        q: 'How do you ask someone to say it again?',
        options: [
          { label: 'Повторіть.', right: true },
          { label: 'Швидше!', right: false },
          { label: 'Тримай позицію!', right: false },
        ],
      },
    },
  ];

  window.PK = { SECTIONS, TERMS, TRACKS, SCENARIOS };
})();
