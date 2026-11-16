export type LearnLanguage = 'fr' | 'en' | 'de' | 'es' | 'pt' | 'it';
export const LANGUAGE_NAMES: Record<LearnLanguage, string> = {
  fr: 'French',
  en: 'English',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
  it: 'Italian',
};
/** The language a request asks for; French when it's missing or unknown. */
export const asLanguage = (value: unknown): LearnLanguage =>
  typeof value === 'string' && value in LANGUAGE_NAMES ? (value as LearnLanguage) : 'fr';

export const LEARN_LANGUAGES = Object.keys(LANGUAGE_NAMES) as LearnLanguage[];
const CODES = LEARN_LANGUAGES;
/** "French, English, German, Spanish, Portuguese or Italian" */
const LANGUAGE_LIST = `${CODES.slice(0, -1)
  .map((code) => LANGUAGE_NAMES[code])
  .join(', ')} or ${LANGUAGE_NAMES[CODES[CODES.length - 1] ?? 'fr']}`;
/** "fr"|"en"|… for the JSON shapes */
const LANGUAGE_CODES = CODES.map((code) => `"${code}"`).join('|');
/** "fr" for French, "en" for English, … */
const LANGUAGE_KEY = CODES.map((code) => `"${code}" for ${LANGUAGE_NAMES[code]}`).join(', ');
/** How nouns are written in their dictionary form, for every language that has articles. */
const NOUN_FORMS =
  'for French nouns with le, la, l’ or un/une; for German nouns capitalised with der, die or das; for Spanish nouns with el or la; for Portuguese nouns with o or a; for Italian nouns with il, lo, la or l’; for English nouns without an article';

/** How dictionary forms are written in each language. */
const WORD_FORMS: Record<LearnLanguage, string> = {
  fr: 'nouns with le, la, l’ or un/une, verbs in the infinitive',
  en: 'nouns without an article, verbs without “to”',
  de: 'nouns capitalised with der, die or das, verbs in the infinitive',
  es: 'nouns with el or la, verbs in the infinitive',
  pt: 'nouns with o or a, verbs in the infinitive',
  it: 'nouns with il, lo, la or l’, verbs in the infinitive',
};

/** body is one lesson's notes; the endpoint has already refused anything too long to read whole. */
export function analysisPrompt(body: string): string {
  return `You are helping a Russian-speaking beginner (A1) learn a foreign language: ${LANGUAGE_LIST}. Below are raw notes from one lesson, written by the teacher in that language and Russian. They are messy: some words have no translation, and some lines are conjugation tables, example sentences or pronunciation rules.

First decide which language the lesson teaches, judging by its vocabulary rather than by headings or labels (a lesson in any of them may still be headed "leçon"): ${LANGUAGE_KEY}.

Reply with only a JSON object of this shape:
{"language": ${LANGUAGE_CODES}, "topic": string, "words": [{"fr": string, "ru": string, "tr": string, "kind": "noun"|"verb"|"adjective"|"adverb"|"expression"|"other", "added": boolean, "sense": string, "key": boolean}], "pairs": [{"a": string, "b": string, "kind": "synonym"|"antonym"}], "verbs": [{"inf": string, "ru": string}]}

Rules:
- topic: what the lesson covered, in English, at most 12 words.
- words: every word or short expression in the lesson's language that the lesson teaches (vocabulary, greetings, question words, set phrases). fr always holds the word being learned, even when the language is not French. For French, write nouns with an article (le, la, l', un, une) when the gender is known; for English, write nouns without an article and verbs without "to"; for German, write nouns capitalised with der, die or das; for Spanish, nouns with el or la; for Portuguese, nouns with o or a; for Italian, nouns with il, lo, la or l'; in every language but English, verbs in the infinitive. Correct obvious spelling mistakes. ru is a short Russian translation: use the teacher's translation when there is one; otherwise write your own and set added to true. tr is the pronunciation the teacher wrote for the word (usually in square brackets, in Cyrillic or IPA), copied without the brackets; never put it inside fr or ru, and use "" when the notes give none. sense is the core meaning as one or two lowercase English words; words whose meanings overlap so that one translation could pass for the other get the same sense (удалить and вырезать: "remove"; выделить and отметить: "mark"; указать and показать: "show"); this holds for expressions too, judged by what they are said for (Bouge ! / Dégage ! / Va-t'en !, проваливай and убирайся: "go away"), so the quiz never offers one as a wrong answer for the other. key is true when the teacher marked the word as a key word with ★ or ⭐ on its line (★ la boulangerie — пекарня); never put the star in fr or ru. Skip a block that starts with a line beginning with 📖: it holds exercises copied from a book, not vocabulary. Skip lines that only show a conjugated form from a verb table, pronunciation rules, numbers written as digits, and words in any other language. Never repeat the same fr.
- pairs: 4 to 12 synonym or antonym pairs where both a and b are exact fr values from words. Use pairs the teacher noted first (for example facile / difficile), then obvious ones among the lesson's words. Return [] if there are none.
- verbs: for a French lesson, every verb in the infinitive, including reflexive ones (se raser) and verbs the lesson conjugates; ru is a short Russian translation. For a lesson in any other language, return [].

Lesson notes:
"""
${body}
"""`;
}

export function conjugationPrompt(infinitive: string, ru: string): string {
  return `Conjugate the French verb "${infinitive}"${ru ? ` (Russian meaning: ${ru})` : ''}.
Reply with only a JSON object:
{"inf": string, "ru": string, "aux": "avoir"|"être", "pp": string, "tenses": {"présent": [..6], "passé composé": [..6], "imparfait": [..6], "futur simple": [..6], "conditionnel présent": [..6], "impératif": [..3]}}
Each item is {"p": string, "f": string}. For the six persons p is "je" (or "j'" before a vowel or mute h), "tu", "il/elle/on", "nous", "vous", "ils/elles", and f is the rest of the form. For reflexive verbs the reflexive pronoun goes in f (p "je", f "me rase"; passé composé f "me suis rasé(e)"). With the auxiliary être, show participle agreement as (e), (s) or (e)s. For impératif p is "tu", "nous", "vous" and f is the imperative (with -toi, -nous, -vous for reflexive verbs); use [] if the verb has no imperative. pp is the past participle, ru a short Russian translation.`;
}

export function gapPrompt(
  words: { fr: string; ru: string }[],
  count: number,
  language: LearnLanguage,
  level = 'A1'
): string {
  const list = words.map((word) => `- ${word.fr} = ${word.ru}`).join('\n');
  return `Write ${count} short, simple ${LANGUAGE_NAMES[language]} sentences at CEFR level ${level} (A0 means a complete beginner: very short sentences with the most common words) for a Russian-speaking learner. Each sentence uses one word from the list below, and that word is the gap to fill. Use each word at most once; reuse words only if the list is shorter than ${count}. The gapped text is the exact form the word takes in the sentence (conjugated verb, agreed adjective, article included for nouns if natural).
Reply with only a JSON array of objects: {"before": string, "after": string, "answer": string, "word": string, "ru": string, "options": [string, string, string]}. before and after are the text around the gap, answer the gapped text, word the list entry it comes from, ru a Russian translation of the whole sentence, options three plausible wrong answers of the same kind (other forms or other words from the list).

Words:
${list}`;
}

/** How one word or phrase the learner marked is described: shared by the photo and the reader. */
const MARKED_ITEM_RULES = `- fr: the marked text exactly as it is written (a single marked phrase stays one item).
- context: the clause it appears in, copied from the text, at most about 12 words.
- ru: a Russian translation that fits this context, in plain everyday Russian (шваб, not швабец; фиксированная плата, not паушальная сумма).
- base: the dictionary form: the infinitive for a verb form, masculine singular for an adjective or participle, the noun with its article for a noun (le/la/l' in French, der/die/das in German, el/la in Spanish, o/a in Portuguese, il/lo/la/l' in Italian, none in English), the fixed expression for an idiom (avoir raison, être en guerre). Use "" when fr is already that form.
- kind: "verb", "noun", "adjective", "adverb", "expression" or "other".
- tense: for a conjugated verb or a phrase built around one, the name of the tense or mood in the text's language, with the person when useful (French: "imparfait, il", "passé composé", "subjonctif présent"; English: "past simple", "present perfect"; German: "Präteritum, er", "Perfekt", "Konjunktiv II"; Spanish: "pretérito indefinido, él", "subjuntivo presente"; Portuguese: "pretérito perfeito", "futuro do conjuntivo"; Italian: "passato prossimo", "congiuntivo presente"); the participle or infinitive by its name in that language for those forms; "" for anything without a verb.
- explanation: one or two short sentences in Russian on what it means here and anything worth knowing: register (разговорное, книжное), literal meaning or origin, a common related expression, why this tense is used.`;

export function photoPrompt(): string {
  return `The image is a photo of a page from a book in ${LANGUAGE_LIST}. A Russian-speaking learner has underlined (or highlighted, or circled) some words and phrases. Find every marked word or phrase, in reading order. Ignore text that is not marked.
Reply with only a JSON object: {"language": ${LANGUAGE_CODES}, "items": [{"fr": string, "context": string, "ru": string, "base": string, "kind": string, "tense": string, "explanation": string}]}.
- language: the language of the book: ${LANGUAGE_KEY}.
${MARKED_ITEM_RULES}`;
}

/** One word or phrase the learner marked while reading a pasted text. */
export function explainPrompt(selection: string, context: string): string {
  return `A Russian-speaking learner is reading a text in ${LANGUAGE_LIST} and marked a word or phrase they don't understand. Explain it as it is used in this sentence.
Marked: """${selection}"""
The sentence around it: """${context}"""
Reply with only a JSON object: {"language": ${LANGUAGE_CODES}, "fr": string, "context": string, "ru": string, "base": string, "kind": string, "tense": string, "explanation": string}.
- language: the language of the text: ${LANGUAGE_KEY}.
${MARKED_ITEM_RULES}`;
}

/** A natural Russian translation of a text, paragraph by paragraph. */
export function translatePrompt(paragraphs: string[]): string {
  return `Translate this text into natural, fluent Russian, the way a good translator would: keep the meaning, tone and register, don't translate word for word, and don't add or leave out anything. It has ${paragraphs.length} paragraph${paragraphs.length === 1 ? '' : 's'}, numbered below.
Reply with only a JSON object: {"paragraphs": [string]} with exactly ${paragraphs.length} item${paragraphs.length === 1 ? '' : 's'}: the translation of each paragraph, in the same order, without the numbers.

${paragraphs.map((paragraph, index) => `[${index + 1}] ${paragraph}`).join('\n\n')}`;
}

/** Vocabulary, questions and true-or-false statements built from a text the learner pasted. */
export function studyPrompt(body: string, levels: Record<LearnLanguage, string>): string {
  return `A Russian-speaking learner pasted the text below (an article, a story, a post) to study with. It is in ${LANGUAGE_LIST}. Their level: ${CODES.map((code) => `${LANGUAGE_NAMES[code]} ${levels[code]}`).join(', ')}; use the level of the text's language.
Reply with only a JSON object:
{"language": ${LANGUAGE_CODES}, "title": string, "words": [{"fr": string, "ru": string, "kind": "noun"|"verb"|"adjective"|"adverb"|"expression"|"other", "sense": string}], "questions": [{"question": string, "ru": string}], "statements": [{"text": string, "ru": string, "correct": boolean, "why": string}]}
- language: the language of the text.
- title: what the text is about, in its own language, at most 8 words.
- words: the 12 to 18 words and expressions from the text most worth learning at this level: skip what such a learner surely knows, prefer what they need to understand the text. fr is the dictionary form (${NOUN_FORMS}; verbs in the infinitive; a set phrase as it is said), ru a short Russian translation that fits the text, sense the core meaning as one or two lowercase English words (words that could be confused share a sense). Never repeat the same fr.
- questions: 5 questions in the text's language, at the learner's level: first 3 about what the text says, then 2 asking for the learner's own opinion or experience. ru is the Russian translation of each.
- statements: 6 statements about the text in its language, for a true-or-false exercise: about half true and half false, each checking a different detail, none of them a word-for-word copy of a sentence. ru is its Russian translation, correct whether it is true, why one short sentence in Russian saying where the text shows it.

Text:
"""
${body}
"""`;
}

export function transcribePrompt(pageCount: number): string {
  return `${pageCount === 1 ? 'The image is a photo' : `The ${pageCount} images are photos, in order,`} of handwritten notes from a language lesson: ${LANGUAGE_LIST} words and phrases, Russian translations, conjugation tables, example sentences, pronunciation in square brackets.
Transcribe every line exactly as written, top to bottom, keeping the writer's line breaks, punctuation, dashes, arrows (→) and square brackets. Keep the writer's spelling and accents; do not correct, translate or add anything. Write a word you cannot read as [?]. Leave out crossed-out text, page numbers and doodles. Separate pages with an empty line.
Reply with only a JSON object: {"title": string, "text": string}. title is what the notes are about, in English, at most 6 words; text is the transcription.`;
}

export function textbookPrompt(): string {
  return `The PDF holds a few pages from a ${LANGUAGE_LIST} textbook, usually one chapter. Write the lesson notes a teacher would write from them for a Russian-speaking learner, as plain text, one item per line, using only what these pages teach:
- Vocabulary, one word per line as "word — перевод": ${NOUN_FORMS}; adjectives in the masculine form; verbs in the infinitive.
- Set phrases and expressions the same way: "phrase — перевод".
- A line "Grammaire:" (for an English textbook "Grammar:", German "Grammatik:", Spanish or Portuguese "Gramática:", Italian "Grammatica:") followed by each grammar point of the chapter: a short rule in Russian and one or two examples.
- A line "Exemples:" ("Examples:", "Beispiele:", "Ejemplos:", "Exemplos:", "Esempi:") followed by up to 10 useful sentences from the pages, each followed by " — " and its Russian translation.
Leave out exercise instructions, answer keys, page numbers, headers and anything not in the textbook's language or about it. Do not invent content that is not on the pages.
Reply with only a JSON object: {"title": string, "text": string}. title is the chapter's topic in English, at most 6 words; text is the notes.`;
}

export interface DiscussionRequest {
  language: LearnLanguage;
  level: string;
  topic: string;
  grammar: string;
  /** the interface language: the grammar explanation is written in it */
  explainIn: ExplainLanguage;
}

const EXPLAIN_NAMES = {
  en: 'English',
  ru: 'Russian',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
  it: 'Italian',
} as const;
export type ExplainLanguage = keyof typeof EXPLAIN_NAMES;
/** The language to explain grammar in; Russian when it's missing or unknown. */
export const asExplainLanguage = (value: unknown): ExplainLanguage =>
  typeof value === 'string' && value in EXPLAIN_NAMES ? (value as ExplainLanguage) : 'ru';

export function discussionPrompt({
  language,
  level,
  topic,
  grammar,
  explainIn,
}: DiscussionRequest): string {
  const languageName = LANGUAGE_NAMES[language];
  const explainName = EXPLAIN_NAMES[explainIn];
  return `You help a teacher start a ${languageName} lesson with a Russian-speaking student at CEFR level ${level}. Write one open discussion question for the start of the lesson.
- Vocabulary topic: ${topic || 'any everyday topic'}. The student may have typed this topic themselves, and it can be anything: a TV series or film (ask about their opinion of it, its characters or its world, without spoiling the plot), a hobby, a news story, a trip, or a kind of words ("new slang words", "words about money"), in which case the question should make them use such words. Build the question, the follow-ups and the vocabulary around it.
- Grammar to practise: ${grammar || 'none in particular'}. The question should make the student answer using it (a question about childhood memories calls for the imparfait, plans for the future call for the futur proche, and so on).
- Match the level strictly: at A1–A2 short, concrete, personal questions with common words; at B1–B2 opinions and experiences; at C1–C2 abstract or debatable questions.
- The question must be about the student’s own life, opinions or experience, never a quiz with a right answer.

Reply with only a JSON object:
{"question": string, "ru": string, "followUps": [string], "vocabulary": [{"word": string, "ru": string}], "starters": [string], "grammarTip": string, "grammarRule": {"title": string, "summary": string, "formation": [string], "usage": [string], "examples": [{"text": string, "translation": string}], "pitfall": string} | null}
- question: the question in ${languageName}.
- ru: its Russian translation.
- followUps: 3 or 4 short follow-up questions in ${languageName} that keep the conversation going.
- vocabulary: 6 to 8 words or expressions useful for answering, in ${languageName} (${WORD_FORMS[language]}), each with a Russian translation.
- starters: 3 sentence beginnings in ${languageName} that use the grammar topic, for the student to finish (for example “Quand j’étais petit, je…”).
- grammarTip: one or two sentences in ${explainName} reminding how to form the grammar point, with a ${languageName} example; "" if there is no grammar topic.
- grammarRule: null if there is no grammar topic. Otherwise a short, clear explanation of the rule for a student at ${level}, written in ${explainName} (forms and examples in ${languageName}): title is the name of the grammar point; summary is one or two sentences on what it is; formation lists the steps or forms (for a tense, how it is built, with the endings or the auxiliary, and irregular forms worth knowing), each item one short line; usage lists when it is used, each item one short line with a tiny ${languageName} example; examples are 3 or 4 natural ${languageName} sentences on the vocabulary topic, each with its ${explainName} translation; pitfall is the most common mistake learners make with it and how to avoid it, one or two sentences.`;
}

/** The heading that starts exercises copied from a book into a lesson, in each language. */
const BOOK_HEADINGS =
  '"📖 Exercices du manuel" (French), "📖 Textbook exercises" (English), "📖 Übungen aus dem Lehrbuch" (German), "📖 Ejercicios del libro" (Spanish), "📖 Exercícios do manual" (Portuguese), "📖 Esercizi dal libro" (Italian)';

/** The grammar, homework and book exercises of one lesson, explained in the interface language. */
export function lessonExtrasPrompt(body: string, explainIn: ExplainLanguage): string {
  const explainName = EXPLAIN_NAMES[explainIn];
  return `Below are a teacher's notes from one language lesson for a Russian-speaking student. The lesson teaches ${LANGUAGE_LIST}, and the notes mix that language with Russian. Find three things in them.

Reply with only a JSON object:
{"language": ${LANGUAGE_CODES}, "grammar": [{"title": string, "summary": string, "formation": [string], "usage": [string], "examples": [{"text": string, "translation": string}], "pitfall": string}], "homework": [{"task": string, "meaning": string}], "book": [{"title": string, "instructions": string, "items": [string]}]}

- language: the language the lesson teaches: ${LANGUAGE_KEY}.
- grammar: every grammar point the lesson teaches or practises: a tense or mood, a construction, agreement, pronouns, prepositions, word order, a conjugation pattern. Not single vocabulary words or set phrases. title is the usual name of the point in the lesson's language ("Le passé composé avec être", "Present perfect", "Wechselpräpositionen"). summary is one or two sentences in ${explainName} on what it is and when it is used. formation lists how it is built (the endings, the auxiliary, irregular forms worth knowing), usage when it is used; each is 2 to 5 short lines in ${explainName}, with tiny examples in the lesson's language. examples are 2 to 4 sentences in the lesson's language, taken from the notes when they have good ones, each with its translation in ${explainName}. pitfall is the most common mistake with it and how to avoid it, one sentence in ${explainName}, or "". Base each point on what the notes show and complete it with standard grammar, so the student can revise from it without the teacher. [] when the lesson has no grammar.
- homework: every task the teacher set for homework or for next time, usually after a word like Devoirs, Homework, Hausaufgaben, Deberes, Tarea, TPC, Compiti, ДЗ or Домашнее задание. task is the task as written; meaning says what to do in ${explainName}, or "" when the task is already written in ${explainName}. [] when there is none.
- book: exercises from the student's book or a textbook that are in the notes, usually in a block that starts with a line beginning with 📖, or mentioned like "p. 34 ex. 2". title is the exercise's number and page as written ("Ex. 2, p. 34"); instructions are its instructions as written; items are its items as written, one per entry, without their numbers, keeping blanks as ___; [] when the notes only refer to the exercise. [] when there are none.

Lesson notes:
"""
${body}
"""`;
}

export interface GrammarPracticeRequest {
  language: LearnLanguage;
  level: string;
  title: string;
  summary: string;
  count: number;
  explainIn: ExplainLanguage;
}

/** Gap sentences that practise one grammar point. */
export function grammarPracticePrompt({
  language,
  level,
  title,
  summary,
  count,
  explainIn,
}: GrammarPracticeRequest): string {
  const languageName = LANGUAGE_NAMES[language];
  return `Write ${count} short ${languageName} sentences at CEFR level ${level} that practise this grammar point: "${title}"${summary ? ` (${summary})` : ''}. A Russian-speaking learner fills one gap in each, where the grammar point decides the answer. Vary the sentences: different persons, verbs and situations, from easy to harder.
Reply with only a JSON array of objects: {"before": string, "after": string, "answer": string, "options": [string, string, string], "ru": string, "why": string}. before and after are the text around the gap, answer the exact text of the gap, options three wrong answers that are typical mistakes with this grammar point (a wrong form, ending, auxiliary, agreement or preposition), never another correct answer. ru is a Russian translation of the whole sentence. why is one short sentence in ${EXPLAIN_NAMES[explainIn]} saying why the answer is right.`;
}

/** Exercises photographed or scanned from a student's book, copied out as text for a lesson. */
export function bookExercisesPrompt(): string {
  return `The pages show exercises from a language student's book (a textbook or a workbook) in ${LANGUAGE_LIST}. Copy out every exercise on them, so the student can do it from the lesson notes.
Reply with only a JSON object: {"text": string}. text is plain text:
- the first line is the heading in the book's language: ${BOOK_HEADINGS};
- then each exercise: one line with its number and page when they are visible and its instructions ("Ex. 2, p. 34 — Mettez les verbes au passé composé."), then its items one per line, numbered "1. ", "2. "…;
- an empty line between exercises.
Copy the words exactly as printed, in the book's language. Write each blank as ___ and keep the words in brackets that go with it. Describe a picture an item needs in a few words in square brackets. Leave out printed answers, page headers, page numbers and anything that is not an exercise.`;
}
