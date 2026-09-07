/* Content for Перший Крок. Rows are compact tuples:
   [uk, translit, en, es, pt, section, exampleUk?, exampleEn?, exampleEs?, examplePt?] */
(function () {
  const SECTIONS = [
    { id: '01', uk: 'Звання', en: 'Ranks & forms of address', es: 'Rangos y tratamientos', pt: 'Patentes e formas de tratamento' },
    { id: '02', uk: 'Команди', en: 'Commands & drill language', es: 'Órdenes y voces de mando', pt: 'Comandos e vozes de comando' },
    { id: '03', uk: 'Медицина', en: 'Medical & casualty terms', es: 'Términos médicos y de bajas', pt: 'Termos médicos e de baixas' },
    { id: '04', uk: 'Спорядження', en: 'Gear & equipment', es: 'Equipo y material', pt: 'Equipamento e material' },
    { id: '05', uk: 'Напрямки', en: 'Directions & distance', es: 'Direcciones y distancias', pt: 'Direções e distâncias' },
    { id: '06', uk: 'Документи', en: 'Reporting & paperwork', es: 'Informes y documentación', pt: 'Relatórios e documentação' },
    { id: '07', uk: 'Побут', en: 'Daily life in a unit', es: 'Vida diaria en la unidad', pt: 'Dia a dia na unidade' },
  ];

  const ROWS = [
    ['солдат', 'soldat', 'soldier', 'soldado', 'soldado', '01'],
    ['сержант', 'serzhant', 'sergeant', 'sargento', 'sargento', '01'],
    ['старший сержант', 'starshyi serzhant', 'senior sergeant', 'sargento primero', 'primeiro-sargento', '01'],
    ['лейтенант', 'leitenant', 'lieutenant', 'teniente', 'tenente', '01'],
    ['капітан', 'kapitan', 'captain', 'capitán', 'capitão', '01'],
    ['командир', 'komandyr', 'commander', 'comandante', 'comandante', '01', 'Де командир?', 'Where is the commander?', '¿Dónde está el comandante?', 'Onde está o comandante?'],
    ['побратим', 'pobratym', 'brother-in-arms', 'hermano de armas', 'irmão de armas', '01'],

    ['Стій!', 'stii', 'Halt! / Stop!', '¡Alto!', 'Alto!', '02'],
    ['Лягай!', 'liahai', 'Get down!', '¡Al suelo!', 'Ao chão!', '02'],
    ['Вперед!', 'vpered', 'Forward! / Move!', '¡Adelante!', 'Avançar!', '02'],
    ['В укриття!', 'v ukryttia', 'Take cover!', '¡A cubierto!', 'Abriguem-se!', '02', '«В укриття!»', '“Take cover!”', '«¡A cubierto!»', '«Abriguem-se!»'],
    ['Вогонь!', 'vohon', 'Fire!', '¡Fuego!', 'Fogo!', '02'],
    ['Не стріляти!', 'ne striliaty', "Don't shoot!", '¡No disparen!', 'Não atirem!', '02'],
    ['Зрозумів.', 'zrozumiv', 'Understood.', 'Entendido.', 'Entendido.', '02'],
    ['Повторіть.', 'povtorit', 'Say again.', 'Repita.', 'Repita.', '02'],
    ['Швидше!', 'shvydshe', 'Faster!', '¡Más rápido!', 'Mais rápido!', '02'],
    ['Тримай позицію!', 'trymai pozytsiiu', 'Hold the position!', '¡Mantén la posición!', 'Mantenha a posição!', '02'],
    ['Готовий?', 'hotovyi', 'Ready?', '¿Listo?', 'Pronto?', '02'],

    ['поранений', 'poranenyi', 'casualty / wounded', 'herido', 'ferido', '03', 'Маємо пораненого!', 'We have a casualty!', '¡Tenemos un herido!', 'Temos um ferido!'],
    ['медик', 'medyk', 'medic', 'sanitario', 'socorrista', '03', 'Потрібен медик!', 'We need a medic!', '¡Necesitamos un sanitario!', 'Precisamos de um socorrista!'],
    ['джгут', 'dzhhut', 'tourniquet', 'torniquete', 'torniquete', '03', 'Наклади джгут!', 'Apply a tourniquet!', '¡Pon un torniquete!', 'Aplique um torniquete!'],
    ['допомога', 'dopomoha', 'help / aid', 'ayuda', 'ajuda', '03'],
    ['евакуація', 'evakuatsiia', 'evacuation', 'evacuación', 'evacuação', '03'],
    ['кровотеча', 'krovotecha', 'bleeding', 'hemorragia', 'hemorragia', '03'],
    ['ноші', 'noshi', 'stretcher', 'camilla', 'maca', '03'],
    ['нога', 'noha', 'leg', 'pierna', 'perna', '03'],
    ['рука', 'ruka', 'arm / hand', 'brazo', 'braço', '03'],
    ['дихає', 'dykhaie', 'breathing (he/she is)', 'respira', 'respira', '03'],

    ['зброя', 'zbroia', 'weapon', 'arma', 'arma', '04', 'Зброю на землю!', 'Weapon on the ground!', '¡Arma al suelo!', 'Arma no chão!'],
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
    ['паспорт', 'pasport', 'passport', 'pasaporte', 'passaporte', '06'],
    ['квиток', 'kvytok', 'ticket', 'billete', 'bilhete', '06', 'Ось мій квиток.', 'Here is my ticket.', 'Aquí está mi billete.', 'Aqui está meu bilhete.'],
    ['кордон', 'kordon', 'border', 'frontera', 'fronteira', '06'],

    ['вода', 'voda', 'water', 'agua', 'água', '07'],
    ['їжа', 'yizha', 'food', 'comida', 'comida', '07'],
    ['спати', 'spaty', 'to sleep', 'dormir', 'dormir', '07'],
    ['холодно', 'kholodno', 'cold (it is)', 'hace frío', 'está frio', '07'],
    ['укриття', 'ukryttia', 'shelter / cover', 'refugio', 'abrigo', '07'],
    ['дякую', 'diakuiu', 'thank you', 'gracias', 'obrigado', '07'],
    ['будь ласка', 'bud laska', 'please / you’re welcome', 'por favor', 'por favor', '07'],
    ['вибачте', 'vybachte', 'excuse me / sorry', 'disculpe', 'desculpe', '07', 'Вибачте, де мій вагон?', 'Excuse me, where is my carriage?', 'Disculpe, ¿dónde está mi vagón?', 'Desculpe, onde está meu vagão?'],
    ['потяг', 'potiah', 'train', 'tren', 'trem', '07'],
    ['вагон', 'vahon', 'carriage / train car', 'vagón', 'vagão', '07'],
    ['місце', 'mistse', 'seat / place', 'asiento', 'assento', '07'],
    ['волонтер', 'volonter', 'volunteer', 'voluntario', 'voluntário', '07'],
  ];

  const TERMS = ROWS.map(([uk, tr, en, es, pt, sec, exUk, exEn, exEs, exPt]) => ({
    uk, tr, en, es, pt, sec,
    example: exUk ? { uk: exUk, en: exEn, es: exEs, pt: exPt } : null,
    letter: uk[0].toUpperCase(),
  }));

  // Progress shown on track cards is computed live from per-scenario
  // localStorage (see app.js) — no hardcoded lesson counts.
  // Title/desc are per-language; `uk` stays fixed.
  const TRACKS = [
    {
      no: '01', level: 'A0 → A1', uk: 'Перший тиждень',
      en: 'First week in a unit', es: 'Primera semana en la unidad', pt: 'Primeira semana na unidade',
      desc: {
        en: 'Greetings, ranks, forms of address, yes/no/understood, basic needs. Day one survival language.',
        es: 'Saludos, rangos, tratamientos, sí/no/entendido, necesidades básicas. Lenguaje de supervivencia para el primer día.',
        pt: 'Saudações, patentes, formas de tratamento, sim/não/entendido, necessidades básicas. Linguagem de sobrevivência para o primeiro dia.',
      },
      tone: 'yellow', tag: 'ТРЕК 01',
    },
    {
      no: '02', level: 'A1', uk: 'На полігоні',
      en: 'On the training ground', es: 'En el campo de entrenamiento', pt: 'No campo de treinamento',
      desc: {
        en: 'Drill commands, weapons handling vocabulary, safety calls, directions and distances.',
        es: 'Voces de mando, vocabulario de manejo de armas, avisos de seguridad, direcciones y distancias.',
        pt: 'Vozes de comando, vocabulário de manuseio de armas, avisos de segurança, direções e distâncias.',
      },
      tone: 'cream', tag: 'ТРЕК 02',
    },
    {
      no: '03', level: 'A1 → A2', uk: 'Медична мова',
      en: 'Medical language', es: 'Lenguaje médico', pt: 'Linguagem médica',
      desc: {
        en: 'Casualty calls, MARCH vocabulary, body parts, evacuation phrases. For medics and everyone else.',
        es: 'Avisos de bajas, vocabulario MARCH, partes del cuerpo, frases de evacuación. Para sanitarios y para todos.',
        pt: 'Chamados de baixa, vocabulário MARCH, partes do corpo, frases de evacuação. Para socorristas e para todos.',
      },
      tone: 'cream', tag: 'ТРЕК 03',
    },
    {
      no: '04', level: 'B1', uk: 'Мова інструктора',
      en: "Instructor's toolkit", es: 'Herramientas del instructor', pt: 'Kit do instrutor',
      desc: {
        en: 'Teaching through an interpreter, giving corrections, classroom + range instructions in Ukrainian.',
        es: 'Enseñar con intérprete, dar correcciones, instrucciones de aula y de campo de tiro en ucraniano.',
        pt: 'Ensinar com intérprete, dar correções, instruções de sala e de estande de tiro em ucraniano.',
      },
      tone: 'blue', tag: 'ТРЕК 04',
      tagNote: { en: 'FOR INSTRUCTORS', es: 'PARA INSTRUCTORES', pt: 'PARA INSTRUTORES' },
    },
    {
      no: '05', level: 'A1', uk: 'У дорозі',
      en: 'Getting there', es: 'El viaje', pt: 'A viagem',
      desc: {
        en: 'Border control, trains, tickets, asking for help — the trip in, before day one.',
        es: 'Control fronterizo, trenes, billetes, pedir ayuda — el viaje de ida, antes del primer día.',
        pt: 'Controle de fronteira, trens, bilhetes, pedir ajuda — a viagem de ida, antes do primeiro dia.',
      },
      tone: 'cream', tag: 'ТРЕК 05',
    },
  ];

  /* Scenarios are journeys: an ordered list of scenes, each scene an ordered
     list of typed steps. Progress is stored per scene as `pk-j-<id>-<sceneId>`.

     Step types (see the scenario engine in app.js):
       line      { lang:'УК'|'EN', uk, tr, en, es, pt } — dialogue; УК is the
                 Ukrainian speaker, EN is the volunteer's turn (badge follows
                 the picked site language). uk/tr teach the Ukrainian; en/es/pt
                 are glosses.
       speak     { uk, tr, en, es, pt } — the learner must say `uk` out loud;
                 validated by speech recognition where available, always
                 skippable.
       choice    { q:{en,es,pt}, options:[{label, right?}] } — multiple choice.
                 Labels stay plain strings; Cyrillic labels are played as audio
                 on a correct answer (and harvested by scripts/tts.mjs).
       translate { uk, tr, keywords:{en,es,pt}, model:{en,es,pt} } — type the
                 translation in your own language, no copy-paste. `keywords` is
                 a list of concepts per language, each an array of acceptable
                 synonyms; ≥60% of concepts matched = pass. `model` is the
                 answer revealed after checking.
       info      { title:{en,es,pt}, body:{en,es,pt}, uk? } — narrative context
                 card (ticket details, what to expect…). One tap to continue.
       form      — reserved for the future document-filling course. Not built.
  */
  const SCENARIOS = [
    {
      id: 'first-week',
      track: '01',
      difficulty: 'A0',
      category: { en: 'FIRST WEEK', es: 'PRIMERA SEMANA', pt: 'PRIMEIRA SEMANA' },
      uk: 'Знайомство.', en: 'Introductions.', es: 'Presentaciones.', pt: 'Apresentações.',
      keyTerms: ['сержант', 'позивний', 'будь ласка', 'дякую'],
      scenes: [
        {
          id: 's1',
          uk: 'Знайомство.', en: 'Introductions.', es: 'Presentaciones.', pt: 'Apresentações.',
          steps: [
            { type: 'line', lang: 'УК', uk: 'Я — сержант Андрій. Позивний «Сокіл».', tr: 'ya — serzhant andrii. pozyvnyi "sokil"', en: 'I am sergeant Andrii. Call sign "Sokil".', es: 'Soy el sargento Andrii. Indicativo «Sokil».', pt: 'Sou o sargento Andrii. Indicativo «Sokil».' },
            { type: 'line', lang: 'EN', uk: 'Дуже приємно. Я — доброволець.', tr: 'duzhe pryiemno. ya — dobrovolets', en: 'Nice to meet you. I am a volunteer.', es: 'Mucho gusto. Soy voluntario.', pt: 'Muito prazer. Sou voluntário.' },
            { type: 'line', lang: 'УК', uk: 'Зрозумів. Говориш українською?', tr: 'zrozumiv. hovorysh ukrainskoiu?', en: 'Understood. Do you speak Ukrainian?', es: 'Entendido. ¿Hablas ucraniano?', pt: 'Entendido. Você fala ucraniano?' },
            { type: 'speak', uk: 'Трохи. Повільно, будь ласка.', tr: 'trokhy. povilno, bud laska', en: 'A little. Slowly, please.', es: 'Un poco. Despacio, por favor.', pt: 'Um pouco. Devagar, por favor.' },
            { type: 'line', lang: 'УК', uk: 'Добре. Дякую, побратиме!', tr: 'dobre. diakuiu, pobratyme!', en: 'Good. Thank you, brother!', es: 'Bien. ¡Gracias, hermano!', pt: 'Bom. Obrigado, irmão!' },
            { type: 'choice',
              q: { en: 'How do you say “thank you”?', es: '¿Cómo se dice «gracias»?', pt: 'Como se diz «obrigado»?' },
              options: [
                { label: 'дякую', right: true },
                { label: 'вода' },
                { label: 'наказ' },
              ] },
          ],
        },
      ],
    },
    {
      id: 'range',
      track: '02',
      difficulty: 'A1',
      category: { en: 'TRAINING GROUND', es: 'CAMPO DE ENTRENAMIENTO', pt: 'CAMPO DE TREINAMENTO' },
      uk: 'На стрільбищі.', en: 'On the range.', es: 'En el campo de tiro.', pt: 'No estande de tiro.',
      keyTerms: ['зброя', 'магазин', 'набої', 'Вогонь!'],
      scenes: [
        {
          id: 's1',
          uk: 'На стрільбищі.', en: 'On the range.', es: 'En el campo de tiro.', pt: 'No estande de tiro.',
          steps: [
            { type: 'line', lang: 'УК', uk: 'Зброю на землю! Магазин від’єднати!', tr: 'zbroiu na zemliu! mahazyn vidiednaty!', en: 'Weapon on the ground! Detach the magazine!', es: '¡Arma al suelo! ¡Retira el cargador!', pt: 'Arma no chão! Retire o carregador!' },
            { type: 'speak', uk: 'Магазин знято. Зброя розряджена.', tr: 'mahazyn zniato. zbroia rozriadzhena', en: 'Magazine off. Weapon is clear.', es: 'Cargador fuera. Arma descargada.', pt: 'Carregador fora. Arma descarregada.' },
            { type: 'line', lang: 'УК', uk: 'Готовий? Набої — двадцять.', tr: 'hotovyi? naboi — dvadtsiat', en: 'Ready? Twenty rounds.', es: '¿Listo? Veinte cartuchos.', pt: 'Pronto? Vinte cartuchos.' },
            { type: 'line', lang: 'УК', uk: 'Вогонь!', tr: 'vohon!', en: 'Fire!', es: '¡Fuego!', pt: 'Fogo!' },
            { type: 'line', lang: 'УК', uk: 'Стій! Не стріляти!', tr: 'stii! ne striliaty!', en: 'Halt! Cease fire!', es: '¡Alto! ¡Alto el fuego!', pt: 'Alto! Cessar fogo!' },
            { type: 'choice',
              q: { en: 'How do you shout “Fire!”?', es: '¿Cómo se grita «¡Fuego!»?', pt: 'Como se grita «Fogo!»?' },
              options: [
                { label: 'Стій!' },
                { label: 'Вогонь!', right: true },
                { label: 'Лягай!' },
              ] },
          ],
        },
      ],
    },
    {
      id: 'medical-casualty',
      track: '03',
      difficulty: 'A1',
      category: { en: 'MEDICAL', es: 'MÉDICO', pt: 'MÉDICO' },
      uk: 'Поранений.', en: 'Casualty.', es: 'Baja.', pt: 'Baixa.',
      keyTerms: ['поранений', 'медик', 'джгут', 'нога'],
      scenes: [
        {
          id: 's1',
          uk: 'Поранений.', en: 'Casualty.', es: 'Baja.', pt: 'Baixa.',
          steps: [
            { type: 'line', lang: 'УК', uk: 'Маємо пораненого! Потрібен медик!', tr: 'maiemo poranenoho! potriben medyk!', en: 'We have a casualty! We need a medic!', es: '¡Tenemos un herido! ¡Necesitamos un sanitario!', pt: 'Temos um ferido! Precisamos de um socorrista!' },
            { type: 'speak', uk: 'Куди його поранено?', tr: 'kudy yoho poraneno', en: 'Where is he hit?', es: '¿Dónde está herido?', pt: 'Onde ele foi atingido?' },
            { type: 'line', lang: 'УК', uk: 'Нога. Наклади джгут!', tr: 'noha. naklady dzhhut!', en: 'The leg. Apply a tourniquet!', es: 'La pierna. ¡Pon un torniquete!', pt: 'A perna. Aplique um torniquete!' },
            { type: 'line', lang: 'EN', uk: 'Джгут накладено. Викликаю евакуацію.', tr: 'dzhhut nakladeno. vyklykaiu evakuatsiiu', en: 'Tourniquet on. Calling for evacuation.', es: 'Torniquete puesto. Pido evacuación.', pt: 'Torniquete aplicado. Chamando evacuação.' },
            { type: 'line', lang: 'УК', uk: 'Ноші сюди! Швидше!', tr: 'noshi siudy! shvydshe!', en: 'Stretcher over here! Faster!', es: '¡La camilla aquí! ¡Más rápido!', pt: 'Maca aqui! Mais rápido!' },
            { type: 'choice',
              q: { en: 'How do you shout “tourniquet”?', es: '¿Cómo se grita «torniquete»?', pt: 'Como se grita «torniquete»?' },
              options: [
                { label: 'укриття' },
                { label: 'джгут', right: true },
                { label: 'звання' },
              ] },
          ],
        },
      ],
    },
    {
      id: 'first-class',
      track: '04',
      difficulty: 'B1',
      category: { en: 'INSTRUCTOR', es: 'INSTRUCTOR', pt: 'INSTRUTOR' },
      uk: 'Перше заняття.', en: 'First class.', es: 'Primera clase.', pt: 'Primeira aula.',
      keyTerms: ['наказ', 'Повторіть.', 'час', 'Готовий?'],
      scenes: [
        {
          id: 's1',
          uk: 'Перше заняття.', en: 'First class.', es: 'Primera clase.', pt: 'Primeira aula.',
          steps: [
            { type: 'line', lang: 'УК', uk: 'Слухай наказ. Повторюй за мною.', tr: 'slukhai nakaz. povtoriui za mnoiu', en: 'Listen to the order. Repeat after me.', es: 'Escucha la orden. Repite conmigo.', pt: 'Escute a ordem. Repita comigo.' },
            { type: 'speak', uk: 'Зрозумів. Повторіть, будь ласка.', tr: 'zrozumiv. povtorit, bud laska', en: 'Understood. Say again, please.', es: 'Entendido. Repita, por favor.', pt: 'Entendido. Repita, por favor.' },
            { type: 'line', lang: 'УК', uk: 'Повільно. Ще раз. Швидше!', tr: 'povilno. shche raz. shvydshe!', en: 'Slowly. Once more. Faster!', es: 'Despacio. Otra vez. ¡Más rápido!', pt: 'Devagar. Mais uma vez. Mais rápido!' },
            { type: 'line', lang: 'УК', uk: 'Добре. Час — п’ять хвилин. Готовий?', tr: 'dobre. chas — piat khvylyn. hotovyi?', en: 'Good. Five minutes. Ready?', es: 'Bien. Cinco minutos. ¿Listo?', pt: 'Bom. Cinco minutos. Pronto?' },
            { type: 'choice',
              q: { en: 'How do you ask someone to say it again?', es: '¿Cómo pides que lo repitan?', pt: 'Como você pede para repetirem?' },
              options: [
                { label: 'Повторіть.', right: true },
                { label: 'Швидше!' },
                { label: 'Тримай позицію!' },
              ] },
          ],
        },
      ],
    },
    {
      id: 'przemysl-lviv',
      track: '05',
      difficulty: 'A1',
      category: { en: 'TRAVEL', es: 'VIAJE', pt: 'VIAGEM' },
      uk: 'Потяг до Львова.', en: 'The train to Lviv.', es: 'El tren a Lviv.', pt: 'O trem para Lviv.',
      keyTerms: ['паспорт', 'квиток', 'потяг', 'вагон', 'місце', 'кордон', 'вибачте', 'волонтер'],
      /* The ticket facts — train 35, carriage 7, seat 42, departure 17:20 —
         are set in scene 1's info card and quizzed again in scenes 1 and 4.
         Keep them in sync if you edit either. */
      scenes: [
        {
          id: 'border-pl',
          uk: 'Кордон у Перемишлі.', en: 'The border at Przemyśl.', es: 'La frontera en Przemyśl.', pt: 'A fronteira em Przemyśl.',
          steps: [
            { type: 'info',
              title: { en: 'Your ticket', es: 'Tu billete', pt: 'Seu bilhete' },
              body: {
                en: 'Train 35, Przemyśl → Lviv. Carriage 7, seat 42, departure 17:20. Before boarding, Polish officers check passports at the station — you mostly need «дякую» and «будь ласка». Memorise the ticket: you will be asked about it.',
                es: 'Tren 35, Przemyśl → Lviv. Vagón 7, asiento 42, salida 17:20. Antes de subir, los agentes polacos revisan pasaportes en la estación — sobre todo necesitas «дякую» y «будь ласка». Memoriza el billete: te preguntarán por él.',
                pt: 'Trem 35, Przemyśl → Lviv. Vagão 7, assento 42, partida 17:20. Antes de embarcar, os agentes poloneses conferem passaportes na estação — você precisa principalmente de «дякую» e «будь ласка». Memorize o bilhete: vão perguntar sobre ele.',
              } },
            { type: 'line', lang: 'УК', uk: 'Ваш паспорт, будь ласка.', tr: 'vash pasport, bud laska', en: 'Your passport, please.', es: 'Su pasaporte, por favor.', pt: 'Seu passaporte, por favor.' },
            { type: 'line', lang: 'EN', uk: 'Ось, будь ласка.', tr: 'os, bud laska', en: 'Here you are.', es: 'Aquí tiene.', pt: 'Aqui está.' },
            { type: 'speak', uk: 'Дякую.', tr: 'diakuiu', en: 'Thank you.', es: 'Gracias.', pt: 'Obrigado.' },
            { type: 'choice',
              q: { en: 'Which carriage is on your ticket?', es: '¿Qué vagón figura en tu billete?', pt: 'Qual vagão está no seu bilhete?' },
              options: [
                { label: '5' },
                { label: '7', right: true },
                { label: '9' },
              ] },
          ],
        },
        {
          id: 'platform',
          uk: 'Платформа і вагон.', en: 'Platform and carriage.', es: 'Plataforma y vagón.', pt: 'Plataforma e vagão.',
          steps: [
            { type: 'info',
              title: { en: 'Finding your seat', es: 'Encontrar tu asiento', pt: 'Encontrar seu assento' },
              body: {
                en: 'Platform 5, carriage 7, seat 42. People will answer with the direction words from the glossary: «прямо», «ліворуч», «праворуч». Ask — Ukrainians help.',
                es: 'Plataforma 5, vagón 7, asiento 42. Te responderán con las palabras de dirección del glosario: «прямо», «ліворуч», «праворуч». Pregunta — los ucranianos ayudan.',
                pt: 'Plataforma 5, vagão 7, assento 42. Vão responder com as palavras de direção do glossário: «прямо», «ліворуч», «праворуч». Pergunte — os ucranianos ajudam.',
              } },
            { type: 'line', lang: 'EN', uk: 'Вибачте, де п’ята платформа?', tr: 'vybachte, de piata platforma', en: 'Excuse me, where is platform five?', es: 'Disculpe, ¿dónde está la plataforma cinco?', pt: 'Desculpe, onde está a plataforma cinco?' },
            { type: 'line', lang: 'УК', uk: 'Прямо і ліворуч.', tr: 'priamo i livoruch', en: 'Straight ahead and to the left.', es: 'Todo recto y a la izquierda.', pt: 'Em frente e à esquerda.' },
            { type: 'speak', uk: 'Вибачте, де мій вагон?', tr: 'vybachte, de mii vahon', en: 'Excuse me, where is my carriage?', es: 'Disculpe, ¿dónde está mi vagón?', pt: 'Desculpe, onde está meu vagão?' },
            { type: 'line', lang: 'УК', uk: 'Сьомий вагон — там.', tr: 'somyi vahon — tam', en: 'Carriage seven is over there.', es: 'El vagón siete está allí.', pt: 'O vagão sete está ali.' },
            { type: 'line', lang: 'EN', uk: 'Це місце сорок два?', tr: 'tse mistse sorok dva', en: 'Is this seat forty-two?', es: '¿Es este el asiento cuarenta y dos?', pt: 'Este é o assento quarenta e dois?' },
            { type: 'line', lang: 'УК', uk: 'Так, сідайте, будь ласка.', tr: 'tak, sidaite, bud laska', en: 'Yes, take a seat, please.', es: 'Sí, siéntese, por favor.', pt: 'Sim, sente-se, por favor.' },
            { type: 'translate', uk: 'Прямо і ліворуч.', tr: 'priamo i livoruch',
              keywords: {
                en: [['straight', 'ahead', 'forward'], ['left']],
                es: [['recto', 'derecho', 'frente'], ['izquierda']],
                pt: [['frente', 'reto', 'direto'], ['esquerda']],
              },
              model: { en: 'Straight ahead and to the left.', es: 'Todo recto y a la izquierda.', pt: 'Em frente e à esquerda.' } },
          ],
        },
        {
          id: 'border-ua',
          uk: 'Прикордонний контроль.', en: 'Border control.', es: 'Control fronterizo.', pt: 'Controle de fronteira.',
          steps: [
            { type: 'info',
              title: { en: 'The questions to expect', es: 'Las preguntas que vienen', pt: 'As perguntas que vêm' },
              body: {
                en: 'On the train, Ukrainian border guards check documents. Expect three questions: purpose of visit, destination, and how long you are staying. Short, calm answers are perfect.',
                es: 'En el tren, los guardias fronterizos ucranianos revisan documentos. Espera tres preguntas: motivo del viaje, destino y cuánto tiempo te quedas. Respuestas cortas y tranquilas son perfectas.',
                pt: 'No trem, os guardas de fronteira ucranianos conferem documentos. Espere três perguntas: motivo da viagem, destino e por quanto tempo você fica. Respostas curtas e calmas são perfeitas.',
              } },
            { type: 'line', lang: 'УК', uk: 'Доброго дня. Прикордонний контроль. Паспорт, будь ласка.', tr: 'dobroho dnia. prykordonnyi kontrol. pasport, bud laska', en: 'Good day. Border control. Passport, please.', es: 'Buenos días. Control fronterizo. Pasaporte, por favor.', pt: 'Bom dia. Controle de fronteira. Passaporte, por favor.' },
            { type: 'line', lang: 'УК', uk: 'Мета візиту?', tr: 'meta vizytu', en: 'Purpose of visit?', es: '¿Motivo del viaje?', pt: 'Motivo da viagem?' },
            { type: 'speak', uk: 'Я волонтер. Їду до Львова.', tr: 'ya volonter. yidu do lvova', en: 'I am a volunteer. I am going to Lviv.', es: 'Soy voluntario. Voy a Lviv.', pt: 'Sou voluntário. Vou para Lviv.' },
            { type: 'line', lang: 'УК', uk: 'Як довго ви будете в Україні?', tr: 'yak dovho vy budete v ukraini', en: 'How long will you be in Ukraine?', es: '¿Cuánto tiempo estará en Ucrania?', pt: 'Quanto tempo você ficará na Ucrânia?' },
            { type: 'line', lang: 'EN', uk: 'Три місяці.', tr: 'try misiatsi', en: 'Three months.', es: 'Tres meses.', pt: 'Três meses.' },
            { type: 'line', lang: 'УК', uk: 'Дякую. Все добре. Гарної дороги!', tr: 'diakuiu. vse dobre. harnoi dorohy!', en: 'Thank you. All good. Have a good trip!', es: 'Gracias. Todo en orden. ¡Buen viaje!', pt: 'Obrigado. Tudo certo. Boa viagem!' },
            { type: 'choice',
              q: { en: 'How does the guard ask about the purpose of your visit?', es: '¿Cómo pregunta el guardia por el motivo de tu viaje?', pt: 'Como o guarda pergunta o motivo da sua viagem?' },
              options: [
                { label: 'Мета візиту?', right: true },
                { label: 'Як довго ви будете в Україні?' },
                { label: 'Ваші квитки, будь ласка.' },
              ] },
          ],
        },
        {
          id: 'conductor',
          uk: 'Провідник.', en: 'The conductor.', es: 'El revisor.', pt: 'O condutor.',
          steps: [
            { type: 'line', lang: 'УК', uk: 'Ваші квитки, будь ласка.', tr: 'vashi kvytky, bud laska', en: 'Your tickets, please.', es: 'Sus billetes, por favor.', pt: 'Suas passagens, por favor.' },
            { type: 'line', lang: 'EN', uk: 'Ось мій квиток.', tr: 'os mii kvytok', en: 'Here is my ticket.', es: 'Aquí está mi billete.', pt: 'Aqui está meu bilhete.' },
            { type: 'line', lang: 'УК', uk: 'Дякую. Чай, кава?', tr: 'diakuiu. chai, kava?', en: 'Thank you. Tea, coffee?', es: 'Gracias. ¿Té, café?', pt: 'Obrigado. Chá, café?' },
            { type: 'speak', uk: 'Чай, будь ласка. Дякую.', tr: 'chai, bud laska. diakuiu', en: 'Tea, please. Thank you.', es: 'Té, por favor. Gracias.', pt: 'Chá, por favor. Obrigado.' },
            { type: 'choice',
              q: { en: 'What time does train 35 depart?', es: '¿A qué hora sale el tren 35?', pt: 'A que horas parte o trem 35?' },
              options: [
                { label: '16:20' },
                { label: '17:20', right: true },
                { label: '18:40' },
              ] },
            { type: 'translate', uk: 'Ваші квитки, будь ласка.', tr: 'vashi kvytky, bud laska',
              keywords: {
                en: [['ticket', 'tickets'], ['please']],
                es: [['billete', 'billetes', 'boleto', 'boletos', 'pasaje', 'pasajes'], ['favor']],
                pt: [['bilhete', 'bilhetes', 'passagem', 'passagens'], ['favor']],
              },
              model: { en: 'Your tickets, please.', es: 'Sus billetes, por favor.', pt: 'Suas passagens, por favor.' } },
            { type: 'info',
              title: { en: 'Lviv', es: 'Lviv', pt: 'Lviv' },
              body: {
                en: 'Welcome to Lviv — Львів. You made it in, in Ukrainian. Next: Track 01, your first week in a unit.',
                es: 'Bienvenido a Lviv — Львів. Llegaste, y en ucraniano. Siguiente: la pista 01, tu primera semana en la unidad.',
                pt: 'Bem-vindo a Lviv — Львів. Você chegou, e em ucraniano. Próximo: a trilha 01, sua primeira semana na unidade.',
              } },
          ],
        },
      ],
    },
  ];

  window.PK = { SECTIONS, TERMS, TRACKS, SCENARIOS };
})();
