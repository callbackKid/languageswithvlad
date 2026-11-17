// Test answers for /api/*, so the app runs under `yarn dev` without a real document, Claude or keys.
// One lesson dated today, with two verbs (se lever, reflexive; aimer, starting with a vowel), a key
// word, homework, a Meet link and the next lesson. Add words or endpoints when a page needs them.

export const DOCUMENT_ID = 'testdocument_run_skill_0001';
// the teacher code this test server accepts (Settings → Teacher)
export const TEACHER_CODE = 'test-teacher';

/* When the next lesson is, which decides what Home and the top bar show:
   - upcoming: in 20 hours (Home: the lesson summary and "Revise before the lesson");
   - now: started 10 minutes ago (top bar "Lesson now", live sync, Enter the lesson);
   - finished: ended a few minutes ago, today (the widget says the lesson is over). */
export const SCENARIOS = ['upcoming', 'now', 'finished'];
const MINUTE = 60_000;
const NEXT_LESSON_FROM_NOW = {
  upcoming: 20 * 60 * MINUTE,
  now: -10 * MINUTE,
  finished: -95 * MINUTE,
};

const pad = (number) => String(number).padStart(2, '0');
const day = (date) => `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
const time = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

function lessonText(scenario) {
  const next = new Date(
    Date.now() + (NEXT_LESSON_FROM_NOW[scenario] ?? NEXT_LESSON_FROM_NOW.upcoming)
  );
  // a German lesson the day before, for German verb tables; the French one stays the newest
  const yesterday = new Date(Date.now() - 24 * 60 * MINUTE);
  // Spanish and Portuguese lessons before that, for their verb tables
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * MINUTE);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * MINUTE);
  return [
    `${day(threeDaysAgo)} 1 Lição`,
    'falar — говорить',
    '',
    `${day(twoDaysAgo)} 1 Lección`,
    'hablar — говорить',
    '',
    `${day(yesterday)} 1 Lektion`,
    'aufstehen — вставать',
    'sich waschen — умываться',
    'das Frühstück — завтрак',
    '',
    `${day(new Date())} 1 Leçon`,
    '★ se lever [sə ləve] — вставать',
    'aimer — любить',
    'la boulangerie — пекарня',
    'le pain — хлеб',
    'le matin — утро',
    'https://meet.google.com/abc-defg-hij',
    'Devoirs: verbes se lever, aimer — présent; mots de la leçon 1; 5 phrases au passé composé',
    `le cours prochain: ${day(next)} ${time(next)}`,
    '',
  ].join('\n');
}

const persons = (forms) =>
  ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'].map((person, index) => ({
    p: person,
    f: forms[index],
  }));

const germanPersons = (forms) =>
  ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'].map((person, index) => ({
    p: person,
    f: forms[index],
  }));

const personsOf = (persons) => (forms) =>
  persons.map((person, index) => ({ p: person, f: forms[index] }));
const spanish = personsOf([
  'yo',
  'tú',
  'él/ella/usted',
  'nosotros/nosotras',
  'vosotros/vosotras',
  'ellos/ellas/ustedes',
]);
const portuguese = personsOf(['eu', 'tu', 'ele/ela/você', 'nós', 'eles/elas/vocês']);

const CONJUGATIONS = {
  hablar: {
    inf: 'hablar',
    ru: 'говорить',
    aux: 'haber',
    pp: 'hablado',
    tenses: {
      'presente de indicativo': spanish([
        'hablo',
        'hablas',
        'habla',
        'hablamos',
        'habláis',
        'hablan',
      ]),
      'pretérito perfecto compuesto': spanish([
        'he hablado',
        'has hablado',
        'ha hablado',
        'hemos hablado',
        'habéis hablado',
        'han hablado',
      ]),
    },
  },
  falar: {
    inf: 'falar',
    ru: 'говорить',
    aux: '',
    pp: 'falado',
    tenses: {
      'presente do indicativo': portuguese(['falo', 'falas', 'fala', 'falamos', 'falam']),
      'pretérito perfeito': portuguese(['falei', 'falaste', 'falou', 'falámos', 'falaram']),
    },
  },
  aufstehen: {
    inf: 'aufstehen',
    ru: 'вставать',
    aux: 'sein',
    pp: 'aufgestanden',
    tenses: {
      Präsens: germanPersons([
        'stehe auf',
        'stehst auf',
        'steht auf',
        'stehen auf',
        'steht auf',
        'stehen auf',
      ]),
      Perfekt: germanPersons([
        'bin aufgestanden',
        'bist aufgestanden',
        'ist aufgestanden',
        'sind aufgestanden',
        'seid aufgestanden',
        'sind aufgestanden',
      ]),
      Präteritum: germanPersons([
        'stand auf',
        'standest auf',
        'stand auf',
        'standen auf',
        'standet auf',
        'standen auf',
      ]),
      'Futur I': germanPersons([
        'werde aufstehen',
        'wirst aufstehen',
        'wird aufstehen',
        'werden aufstehen',
        'werdet aufstehen',
        'werden aufstehen',
      ]),
      'Konjunktiv II': germanPersons([
        'würde aufstehen',
        'würdest aufstehen',
        'würde aufstehen',
        'würden aufstehen',
        'würdet aufstehen',
        'würden aufstehen',
      ]),
    },
  },
  'sich waschen': {
    inf: 'sich waschen',
    ru: 'умываться',
    aux: 'haben',
    pp: 'gewaschen',
    tenses: {
      Präsens: germanPersons([
        'wasche mich',
        'wäschst dich',
        'wäscht sich',
        'waschen uns',
        'wascht euch',
        'waschen sich',
      ]),
      Perfekt: germanPersons([
        'habe mich gewaschen',
        'hast dich gewaschen',
        'hat sich gewaschen',
        'haben uns gewaschen',
        'habt euch gewaschen',
        'haben sich gewaschen',
      ]),
    },
  },
  'se lever': {
    inf: 'se lever',
    ru: 'вставать',
    aux: 'être',
    pp: 'levé',
    tenses: {
      présent: persons([
        'me lève',
        'te lèves',
        'se lève',
        'nous levons',
        'vous levez',
        'se lèvent',
      ]),
      'passé composé': persons([
        'me suis levé(e)',
        't’es levé(e)',
        's’est levé(e)',
        'nous sommes levé(e)s',
        'vous êtes levé(e)(s)',
        'se sont levé(e)s',
      ]),
      impératif: [
        { p: 'tu', f: 'lève-toi' },
        { p: 'nous', f: 'levons-nous' },
        { p: 'vous', f: 'levez-vous' },
      ],
    },
  },
  aimer: {
    inf: 'aimer',
    ru: 'любить',
    aux: 'avoir',
    pp: 'aimé',
    tenses: {
      présent: [
        { p: 'j’', f: 'aime' },
        ...persons(['', 'aimes', 'aime', 'aimons', 'aimez', 'aiment']).slice(1),
      ],
      'passé composé': [
        { p: 'j’', f: 'ai aimé' },
        ...persons(['', 'as aimé', 'a aimé', 'avons aimé', 'avez aimé', 'ont aimé']).slice(1),
      ],
    },
  },
};

const oneVerbAnalysis = (language, verb) => ({
  language,
  topic: 'Talking',
  pairs: [],
  words: [{ fr: verb, ru: 'говорить', tr: '', kind: 'verb', added: false }],
  verbs: [{ inf: verb, ru: 'говорить' }],
});

const GERMAN_ANALYSIS = {
  language: 'de',
  topic: 'Der Morgen',
  pairs: [],
  words: [
    { fr: 'aufstehen', ru: 'вставать', tr: '', kind: 'verb', added: false },
    { fr: 'sich waschen', ru: 'умываться', tr: '', kind: 'verb', added: false },
    { fr: 'das Frühstück', ru: 'завтрак', tr: '', kind: 'noun', added: false },
  ],
  verbs: [
    { inf: 'aufstehen', ru: 'вставать' },
    { inf: 'sich waschen', ru: 'умываться' },
  ],
};

const ANALYSIS = {
  language: 'fr',
  topic: 'Morning routine',
  pairs: [],
  words: [
    { fr: 'se lever', ru: 'вставать', tr: 'sə ləve', kind: 'verb', added: false, key: true },
    { fr: 'aimer', ru: 'любить', tr: '', kind: 'verb', added: false },
    { fr: 'la boulangerie', ru: 'пекарня', tr: '', kind: 'noun', added: false },
    { fr: 'le pain', ru: 'хлеб', tr: '', kind: 'noun', added: false },
    { fr: 'le matin', ru: 'утро', tr: '', kind: 'noun', added: false },
  ],
  verbs: [
    { inf: 'se lever', ru: 'вставать' },
    { inf: 'aimer', ru: 'любить' },
  ],
};

const EXTRAS = {
  language: 'fr',
  grammar: [
    {
      title: 'Les verbes pronominaux',
      summary: 'Reflexive verbs take a pronoun that matches the subject: je me lève, tu te lèves.',
      formation: [
        'me, te, se, nous, vous, se + verb',
        'passé composé with être: je me suis levé(e)',
      ],
      usage: ['daily routine: se lever, se laver, s’habiller'],
      examples: [{ text: 'Je me lève à sept heures.', translation: 'Я встаю в семь часов.' }],
      pitfall: 'Don’t drop the pronoun: je me lève, not je lève.',
    },
  ],
  homework: [
    { task: 'verbes se lever, aimer — présent', meaning: 'Conjugate both verbs in the present.' },
    { task: 'mots de la leçon 1', meaning: 'Learn the words of lesson 1.' },
    { task: '5 phrases au passé composé', meaning: 'Write 5 sentences in the passé composé.' },
  ],
  book: [
    {
      title: 'Exercice 3, page 24',
      instructions: 'Complétez avec le verbe se lever au présent.',
      items: ['Je … à 7 heures.', 'Nous … tôt le samedi.'],
    },
  ],
};

const MADE_HOMEWORK = {
  language: 'fr',
  tense: 'présent',
  verbs: ['se lever', 'aimer'],
  translate: ['Я встаю в семь часов.', 'Я люблю хлеб.'],
  writing: 'Décrivez votre matin en 5 phrases.',
};

const WRITING_CHECK = {
  corrected: 'Hier, je me suis levé à sept heures.',
  mistakes: [
    { wrong: 'je suis levé', right: 'je me suis levé', why: 'Se lever keeps its pronoun.' },
  ],
  comment: 'Good sentence; mind the reflexive pronoun.',
};

const EXPLANATION = {
  language: 'fr',
  fr: 'boulangerie',
  context: 'Je vais à la boulangerie le matin.',
  ru: 'пекарня',
  base: 'la boulangerie',
  kind: 'noun',
  tense: '',
  explanation: 'A shop where bread is baked and sold.',
};

const DISCUSSION = {
  question: 'Qu’est-ce que vous faites le matin avant le travail ?',
  ru: 'Что вы делаете утром перед работой?',
  followUps: ['À quelle heure vous levez-vous ?', 'Vous aimez le petit-déjeuner ?'],
  vocabulary: [
    { word: 'se lever', ru: 'вставать' },
    { word: 'le petit-déjeuner', ru: 'завтрак' },
  ],
  starters: ['Le matin, je…', 'D’habitude, je me lève…'],
  grammarTip: 'Use reflexive verbs for your routine.',
  grammarRule: EXTRAS.grammar[0],
};

/** The JSON body for one API request; {} for endpoints this fixture doesn't cover. */
export function answerFor(url, body, headers = {}, scenario = 'upcoming') {
  const path = new URL(url).pathname;
  if (path === '/api/health')
    return {
      needsCode: false,
      ai: true,
      teacherCode: true,
      feedback: true,
      // adding to the document needs the service account's email (Make homework, Send to the teacher)
      docWriter: 'cahier@test-project.iam.gserviceaccount.com',
      teacher: headers['x-teacher-code'] === TEACHER_CODE,
    };
  if (path === '/api/doc') return { title: 'Test lesson', text: lessonText(scenario) };
  if (path === '/api/conjugate') return CONJUGATIONS[body?.inf] ?? {};
  if (path === '/api/analyze') {
    if (!body?.action || body.action === 'words')
      return body?.body?.includes('aufstehen')
        ? GERMAN_ANALYSIS
        : body?.body?.includes('hablar')
          ? oneVerbAnalysis('es', 'hablar')
          : body?.body?.includes('falar')
            ? oneVerbAnalysis('pt', 'falar')
            : ANALYSIS;
    if (body.action === 'extras') return EXTRAS;
    if (body.action === 'homework') return MADE_HOMEWORK;
    return {};
  }
  if (path === '/api/text') {
    if (body?.action === 'correct') return WRITING_CHECK;
    if (body?.action === 'explain') return EXPLANATION;
    return {};
  }
  if (path === '/api/discussion') return DISCUSSION;
  if (path === '/api/append') return { ok: true };
  return {};
}
