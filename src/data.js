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

    ['вода', 'voda', 'water', 'agua', 'água', '07'],
    ['їжа', 'yizha', 'food', 'comida', 'comida', '07'],
    ['спати', 'spaty', 'to sleep', 'dormir', 'dormir', '07'],
    ['холодно', 'kholodno', 'cold (it is)', 'hace frío', 'está frio', '07'],
    ['укриття', 'ukryttia', 'shelter / cover', 'refugio', 'abrigo', '07'],
    ['дякую', 'diakuiu', 'thank you', 'gracias', 'obrigado', '07'],
    ['будь ласка', 'bud laska', 'please / you’re welcome', 'por favor', 'por favor', '07'],
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
  ];

  /* Scenario lines:
     - УК lines: `uk` is the Ukrainian phrase; en/es/pt are glosses.
     - Foreign lines (lang 'EN'): en/es/pt is what the volunteer says in their own
       language; `tr` holds the Ukrainian rendering + transliteration. */
  const SCENARIOS = [
    {
      track: '01',
      category: { en: 'FIRST WEEK', es: 'PRIMERA SEMANA', pt: 'PRIMEIRA SEMANA' },
      uk: 'Знайомство.', en: 'Introductions.', es: 'Presentaciones.', pt: 'Apresentações.',
      lines: [
        { lang: 'УК', uk: 'Я — сержант Андрій. Позивний «Сокіл».', tr: 'ya — serzhant andrii. pozyvnyi "sokil"', en: 'I am sergeant Andrii. Call sign "Sokil".', es: 'Soy el sargento Andrii. Indicativo «Sokil».', pt: 'Sou o sargento Andrii. Indicativo «Sokil».' },
        { lang: 'EN', en: 'Nice to meet you. I am a volunteer.', es: 'Mucho gusto. Soy voluntario.', pt: 'Muito prazer. Sou voluntário.', tr: 'Дуже приємно. Я — доброволець. [duzhe pryiemno. ya — dobrovolets]' },
        { lang: 'УК', uk: 'Зрозумів. Говориш українською?', tr: 'zrozumiv. hovorysh ukrainskoiu?', en: 'Understood. Do you speak Ukrainian?', es: 'Entendido. ¿Hablas ucraniano?', pt: 'Entendido. Você fala ucraniano?' },
        { lang: 'EN', en: 'A little. Slowly, please.', es: 'Un poco. Despacio, por favor.', pt: 'Um pouco. Devagar, por favor.', tr: 'Трохи. Повільно, будь ласка. [trokhy. povilno, bud laska]' },
        { lang: 'УК', uk: 'Добре. Дякую, побратиме!', tr: 'dobre. diakuiu, pobratyme!', en: 'Good. Thank you, brother!', es: 'Bien. ¡Gracias, hermano!', pt: 'Bom. Obrigado, irmão!' },
      ],
      keyTerms: ['сержант', 'позивний', 'будь ласка', 'дякую'],
      drill: {
        q: { en: 'How do you say “thank you”?', es: '¿Cómo se dice «gracias»?', pt: 'Como se diz «obrigado»?' },
        options: [
          { label: 'дякую', right: true },
          { label: 'вода', right: false },
          { label: 'наказ', right: false },
        ],
      },
    },
    {
      track: '02',
      category: { en: 'TRAINING GROUND', es: 'CAMPO DE ENTRENAMIENTO', pt: 'CAMPO DE TREINAMENTO' },
      uk: 'На стрільбищі.', en: 'On the range.', es: 'En el campo de tiro.', pt: 'No estande de tiro.',
      lines: [
        { lang: 'УК', uk: 'Зброю на землю! Магазин від’єднати!', tr: 'zbroiu na zemliu! mahazyn vidiednaty!', en: 'Weapon on the ground! Detach the magazine!', es: '¡Arma al suelo! ¡Retira el cargador!', pt: 'Arma no chão! Retire o carregador!' },
        { lang: 'EN', en: 'Magazine off. Weapon is clear.', es: 'Cargador fuera. Arma descargada.', pt: 'Carregador fora. Arma descarregada.', tr: 'Магазин знято. Зброя розряджена. [mahazyn zniato. zbroia rozriadzhena]' },
        { lang: 'УК', uk: 'Готовий? Набої — двадцять.', tr: 'hotovyi? naboi — dvadtsiat', en: 'Ready? Twenty rounds.', es: '¿Listo? Veinte cartuchos.', pt: 'Pronto? Vinte cartuchos.' },
        { lang: 'УК', uk: 'Вогонь!', tr: 'vohon!', en: 'Fire!', es: '¡Fuego!', pt: 'Fogo!' },
        { lang: 'УК', uk: 'Стій! Не стріляти!', tr: 'stii! ne striliaty!', en: 'Halt! Cease fire!', es: '¡Alto! ¡Alto el fuego!', pt: 'Alto! Cessar fogo!' },
      ],
      keyTerms: ['зброя', 'магазин', 'набої', 'Вогонь!'],
      drill: {
        q: { en: 'How do you shout “Fire!”?', es: '¿Cómo se grita «¡Fuego!»?', pt: 'Como se grita «Fogo!»?' },
        options: [
          { label: 'Стій!', right: false },
          { label: 'Вогонь!', right: true },
          { label: 'Лягай!', right: false },
        ],
      },
    },
    {
      track: '03',
      category: { en: 'MEDICAL', es: 'MÉDICO', pt: 'MÉDICO' },
      uk: 'Поранений.', en: 'Casualty.', es: 'Baja.', pt: 'Baixa.',
      lines: [
        { lang: 'УК', uk: 'Маємо пораненого! Потрібен медик!', tr: 'maiemo poranenoho! potriben medyk!', en: 'We have a casualty! We need a medic!', es: '¡Tenemos un herido! ¡Necesitamos un sanitario!', pt: 'Temos um ferido! Precisamos de um socorrista!' },
        { lang: 'EN', en: 'Where is he hit?', es: '¿Dónde está herido?', pt: 'Onde ele foi atingido?', tr: 'Куди його поранено? [kudy yoho poraneno?]' },
        { lang: 'УК', uk: 'Нога. Наклади джгут!', tr: 'noha. naklady dzhhut!', en: 'The leg. Apply a tourniquet!', es: 'La pierna. ¡Pon un torniquete!', pt: 'A perna. Aplique um torniquete!' },
        { lang: 'EN', en: 'Tourniquet on. Calling for evacuation.', es: 'Torniquete puesto. Pido evacuación.', pt: 'Torniquete aplicado. Chamando evacuação.', tr: 'Джгут накладено. Викликаю евакуацію.' },
        { lang: 'УК', uk: 'Ноші сюди! Швидше!', tr: 'noshi siudy! shvydshe!', en: 'Stretcher over here! Faster!', es: '¡La camilla aquí! ¡Más rápido!', pt: 'Maca aqui! Mais rápido!' },
      ],
      keyTerms: ['поранений', 'медик', 'джгут', 'нога'],
      drill: {
        q: { en: 'How do you shout “tourniquet”?', es: '¿Cómo se grita «torniquete»?', pt: 'Como se grita «torniquete»?' },
        options: [
          { label: 'укриття', right: false },
          { label: 'джгут', right: true },
          { label: 'звання', right: false },
        ],
      },
    },
    {
      track: '04',
      category: { en: 'INSTRUCTOR', es: 'INSTRUCTOR', pt: 'INSTRUTOR' },
      uk: 'Перше заняття.', en: 'First class.', es: 'Primera clase.', pt: 'Primeira aula.',
      lines: [
        { lang: 'УК', uk: 'Слухай наказ. Повторюй за мною.', tr: 'slukhai nakaz. povtoriui za mnoiu', en: 'Listen to the order. Repeat after me.', es: 'Escucha la orden. Repite conmigo.', pt: 'Escute a ordem. Repita comigo.' },
        { lang: 'EN', en: 'Understood. Say again, please.', es: 'Entendido. Repita, por favor.', pt: 'Entendido. Repita, por favor.', tr: 'Зрозумів. Повторіть, будь ласка. [zrozumiv. povtorit, bud laska]' },
        { lang: 'УК', uk: 'Повільно. Ще раз. Швидше!', tr: 'povilno. shche raz. shvydshe!', en: 'Slowly. Once more. Faster!', es: 'Despacio. Otra vez. ¡Más rápido!', pt: 'Devagar. Mais uma vez. Mais rápido!' },
        { lang: 'УК', uk: 'Добре. Час — п’ять хвилин. Готовий?', tr: 'dobre. chas — piat khvylyn. hotovyi?', en: 'Good. Five minutes. Ready?', es: 'Bien. Cinco minutos. ¿Listo?', pt: 'Bom. Cinco minutos. Pronto?' },
      ],
      keyTerms: ['наказ', 'Повторіть.', 'час', 'Готовий?'],
      drill: {
        q: { en: 'How do you ask someone to say it again?', es: '¿Cómo pides que lo repitan?', pt: 'Como você pede para repetirem?' },
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
