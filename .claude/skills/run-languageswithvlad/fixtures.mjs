// Test answers for /api/*, so the app runs under `yarn dev` without a real document, Claude or keys.
// One lesson with two verbs: a reflexive one (se lever) and one that starts with a vowel (aimer).
// Add words, verbs or endpoints here when a page you check needs them.

export const DOCUMENT_ID = 'testdocument_run_skill_0001';
// the teacher code this test server accepts (Settings → Teacher)
export const TEACHER_CODE = 'test-teacher';

const LESSON = '14.11.2026 1 Leçon\nse lever — вставать\naimer — любить\n';

const persons = (forms) =>
  ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'].map((person, index) => ({
    p: person,
    f: forms[index],
  }));

const CONJUGATIONS = {
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

const ANALYSIS = {
  language: 'fr',
  topic: 'Morning routine',
  pairs: [],
  words: [
    { fr: 'se lever', ru: 'вставать', tr: '', kind: 'verb', added: false },
    { fr: 'aimer', ru: 'любить', tr: '', kind: 'verb', added: false },
  ],
  verbs: [
    { inf: 'se lever', ru: 'вставать' },
    { inf: 'aimer', ru: 'любить' },
  ],
};

/** The JSON body for one API request; {} for endpoints this fixture doesn't cover. */
export function answerFor(url, body, headers = {}) {
  const path = new URL(url).pathname;
  if (path === '/api/health')
    return {
      needsCode: false,
      ai: true,
      teacherCode: true,
      teacher: headers['x-teacher-code'] === TEACHER_CODE,
    };
  if (path === '/api/doc') return { title: 'Test lesson', text: LESSON };
  if (path === '/api/conjugate') return CONJUGATIONS[body?.inf] ?? {};
  // grammar, homework and the other analyze actions get an empty answer
  if (path === '/api/analyze' && !body?.action) return ANALYSIS;
  return {};
}
