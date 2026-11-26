import { type Word } from '@/entities/word';
import {
  asLanguage,
  isVerbLanguage,
  type Language,
  type Tense,
  TENSES_BY_LANGUAGE,
} from '@/shared/config';
import { asText } from '@/shared/lib/util';

/* The "Devoirs:" block for homework Claude made from a lesson, in the lesson's language and in
   words the homework checklist reads (src/entities/homework/model/homework.ts), so each task opens its exercise:

     Devoirs:
     - mots de la leçon 6 — surtout : la boulangerie, le croissant
     - phrases à trous : mots de la leçon 6
     - verbes aller, venir — passé composé
     - traduire : Я купил хлеб. / Мы идём в булочную.
     - écrire 5 phrases au passé composé sur votre week-end */

interface Phrases {
  label: string;
  words: (number: number) => string;
  especially: string;
  gaps: (number: number) => string;
  verbs: string;
  translate: string;
}
const PHRASES: Record<Language, Phrases> = {
  fr: {
    label: 'Devoirs',
    words: (number) => `mots de la leçon ${number}`,
    especially: 'surtout :',
    gaps: (number) => `phrases à trous : mots de la leçon ${number}`,
    verbs: 'verbes',
    translate: 'traduire :',
  },
  en: {
    label: 'Homework',
    words: (number) => `words of lesson ${number}`,
    especially: 'especially:',
    gaps: (number) => `gap sentences: words of lesson ${number}`,
    verbs: 'verbs',
    translate: 'translate:',
  },
  de: {
    label: 'Hausaufgaben',
    words: (number) => `Wörter der Lektion ${number}`,
    especially: 'vor allem:',
    gaps: (number) => `Lückensätze: Wörter der Lektion ${number}`,
    verbs: 'Verben',
    translate: 'übersetzen:',
  },
  es: {
    label: 'Deberes',
    words: (number) => `palabras de la lección ${number}`,
    especially: 'sobre todo:',
    gaps: (number) => `frases con huecos: palabras de la lección ${number}`,
    verbs: 'verbos',
    translate: 'traducir:',
  },
  pt: {
    label: 'Trabalho de casa',
    words: (number) => `palavras da lição ${number}`,
    especially: 'sobretudo:',
    gaps: (number) => `frases com lacunas: palavras da lição ${number}`,
    verbs: 'verbos',
    translate: 'traduzir:',
  },
  it: {
    label: 'Compiti',
    words: (number) => `parole della lezione ${number}`,
    especially: 'soprattutto:',
    gaps: (number) => `frasi con spazi vuoti: parole della lezione ${number}`,
    verbs: 'verbi',
    translate: 'tradurre:',
  },
};

// How many sentences to translate the teacher can ask for; the server keeps to the same range.
export const MIN_TRANSLATE_SENTENCES = 2;
export const MAX_TRANSLATE_SENTENCES = 8;
// At most this many key words named in the words task.
const KEY_WORDS_SHOWN = 5;
// a semicolon would split a task in two (homeworkItems)
const oneTask = (text: string) => text.replace(/;/g, ',').replace(/\s+/g, ' ').trim();

// The homework block for a lesson, from Claude's reply and the lesson's words.
export const homeworkBlock = ({
  raw,
  lessonNumber,
  words,
  gaps,
}: {
  raw: unknown;
  lessonNumber: number;
  words: Word[];
  // gap sentences need Claude, so they are offered only when the app has it
  gaps: boolean;
}): string => {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const language = asLanguage(data.language);
  const phrases = PHRASES[language];
  const list = (value: unknown) =>
    (Array.isArray(value) ? value : []).map(asText).map(oneTask).filter(Boolean);
  const keyWords = words
    .filter((word) => word.key)
    .slice(0, KEY_WORDS_SHOWN)
    .map((word) => word.fr);
  // verbs to conjugate only where there are verb tables, and only in a tense of that language:
  // the one Claude chose, or the first (présent, Präsens)
  const verbLanguage = isVerbLanguage(language) ? language : null;
  const tenses: readonly Tense[] = verbLanguage ? TENSES_BY_LANGUAGE[verbLanguage] : [];
  const tense = tenses.find((name) => name === asText(data.tense)) ?? tenses[0];
  const verbs = verbLanguage ? list(data.verbs).slice(0, 3) : [];
  const translate = list(data.translate).slice(0, MAX_TRANSLATE_SENTENCES);
  const writing = oneTask(asText(data.writing));

  const tasks: string[] = [];
  if (words.length)
    tasks.push(
      phrases.words(lessonNumber) +
        (keyWords.length ? ` — ${phrases.especially} ${keyWords.join(', ')}` : '')
    );
  if (gaps && words.length) tasks.push(phrases.gaps(lessonNumber));
  if (verbs.length && tense) tasks.push(`${phrases.verbs} ${verbs.join(', ')} — ${tense}`);
  if (translate.length) tasks.push(`${phrases.translate} ${translate.join(' / ')}`);
  if (writing) tasks.push(writing);
  return [`${phrases.label}:`, ...tasks.map((task) => `- ${task}`)].join('\n');
};

// "Devoirs", "Homework", …: the label a homework block starts with in a language.
export const homeworkLabel = (language: Language) => PHRASES[language].label;
