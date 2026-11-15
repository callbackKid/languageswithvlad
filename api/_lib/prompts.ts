export type LearnLanguage = 'fr' | 'en' | 'de';
export const LANGUAGE_NAMES: Record<LearnLanguage, string> = {
  fr: 'French',
  en: 'English',
  de: 'German',
};
/** The language a request asks for; French when it's missing or unknown. */
export const asLanguage = (value: unknown): LearnLanguage =>
  value === 'en' || value === 'de' ? value : 'fr';

/** How dictionary forms are written in each language. */
const WORD_FORMS: Record<LearnLanguage, string> = {
  fr: 'nouns with le, la, l’ or un/une, verbs in the infinitive',
  en: 'nouns without an article, verbs without “to”',
  de: 'nouns capitalised with der, die or das, verbs in the infinitive',
};

export function analysisPrompt(body: string): string {
  return `You are helping a Russian-speaking beginner (A1) learn a foreign language: French, English or German. Below are raw notes from one lesson, written by the teacher in that language and Russian. They are messy: some words have no translation, and some lines are conjugation tables, example sentences or pronunciation rules.

First decide which language the lesson teaches, judging by its vocabulary rather than by headings or labels (an English or German lesson may still be headed "leçon"): "fr" for French, "en" for English, "de" for German.

Reply with only a JSON object of this shape:
{"language": "fr"|"en"|"de", "topic": string, "words": [{"fr": string, "ru": string, "tr": string, "kind": "noun"|"verb"|"adjective"|"adverb"|"expression"|"other", "added": boolean, "sense": string}], "pairs": [{"a": string, "b": string, "kind": "synonym"|"antonym"}], "verbs": [{"inf": string, "ru": string}]}

Rules:
- topic: what the lesson covered, in English, at most 12 words.
- words: every word or short expression in the lesson's language that the lesson teaches (vocabulary, greetings, question words, set phrases). fr always holds the word being learned, even when the language is English or German. For French, write nouns with an article (le, la, l', un, une) when the gender is known; for English, write nouns without an article and verbs without "to"; for German, write nouns capitalised with der, die or das and verbs in the infinitive. Correct obvious spelling mistakes. ru is a short Russian translation: use the teacher's translation when there is one; otherwise write your own and set added to true. tr is the pronunciation the teacher wrote for the word (usually in square brackets, in Cyrillic or IPA), copied without the brackets; never put it inside fr or ru, and use "" when the notes give none. sense is the core meaning as one or two lowercase English words; words whose meanings overlap so that one translation could pass for the other get the same sense (удалить and вырезать: "remove"; выделить and отметить: "mark"; указать and показать: "show"); this holds for expressions too, judged by what they are said for (Bouge ! / Dégage ! / Va-t'en !, проваливай and убирайся: "go away"), so the quiz never offers one as a wrong answer for the other. Skip lines that only show a conjugated form from a verb table, pronunciation rules, numbers written as digits, and words in any other language. Never repeat the same fr.
- pairs: 4 to 12 synonym or antonym pairs where both a and b are exact fr values from words. Use pairs the teacher noted first (for example facile / difficile), then obvious ones among the lesson's words. Return [] if there are none.
- verbs: for a French lesson, every verb in the infinitive, including reflexive ones (se raser) and verbs the lesson conjugates; ru is a short Russian translation. For an English or German lesson, return [].

Lesson notes:
"""
${body.slice(0, 14000)}
"""`;
}

export function conjPrompt(infinitive: string, ru: string): string {
  return `Conjugate the French verb "${infinitive}"${ru ? ` (Russian meaning: ${ru})` : ''}.
Reply with only a JSON object:
{"inf": string, "ru": string, "aux": "avoir"|"être", "pp": string, "tenses": {"présent": [..6], "passé composé": [..6], "imparfait": [..6], "futur simple": [..6], "conditionnel présent": [..6], "impératif": [..3]}}
Each item is {"p": string, "f": string}. For the six persons p is "je" (or "j'" before a vowel or mute h), "tu", "il/elle/on", "nous", "vous", "ils/elles", and f is the rest of the form. For reflexive verbs the reflexive pronoun goes in f (p "je", f "me rase"; passé composé f "me suis rasé(e)"). With the auxiliary être, show participle agreement as (e), (s) or (e)s. For impératif p is "tu", "nous", "vous" and f is the imperative (with -toi, -nous, -vous for reflexive verbs); use [] if the verb has no imperative. pp is the past participle, ru a short Russian translation.`;
}

export function gapPrompt(
  words: { fr: string; ru: string }[],
  count: number,
  language: LearnLanguage
): string {
  const list = words.map((word) => `- ${word.fr} = ${word.ru}`).join('\n');
  return `Write ${count} short, simple ${LANGUAGE_NAMES[language]} sentences (A1 level) for a Russian-speaking beginner. Each sentence uses one word from the list below, and that word is the gap to fill. Use each word at most once; reuse words only if the list is shorter than ${count}. The gapped text is the exact form the word takes in the sentence (conjugated verb, agreed adjective, article included for nouns if natural).
Reply with only a JSON array of objects: {"before": string, "after": string, "answer": string, "word": string, "ru": string, "options": [string, string, string]}. before and after are the text around the gap, answer the gapped text, word the list entry it comes from, ru a Russian translation of the whole sentence, options three plausible wrong answers of the same kind (other forms or other words from the list).

Words:
${list}`;
}

export function photoPrompt(): string {
  return `The image is a photo of a page from a book in French, English or German. A Russian-speaking learner has underlined (or highlighted, or circled) some words and phrases. Find every marked word or phrase, in reading order. Ignore text that is not marked.
Reply with only a JSON object: {"language": "fr"|"en"|"de", "items": [{"fr": string, "context": string, "ru": string, "base": string, "kind": string, "tense": string, "explanation": string}]}.
- language: the language of the book: "fr" for French, "en" for English, "de" for German.
- fr: the marked text exactly as printed (a single marked phrase stays one item).
- context: the clause it appears in, copied from the page, at most about 12 words.
- ru: a Russian translation that fits this context, in plain everyday Russian (шваб, not швабец; фиксированная плата, not паушальная сумма).
- base: the dictionary form: the infinitive for a verb form, masculine singular for an adjective or participle, the noun with its article for a noun (le/la/l' in French, der/die/das in German, none in English), the fixed expression for an idiom (avoir raison, être en guerre). Use "" when fr is already that form.
- kind: "verb", "noun", "adjective", "adverb", "expression" or "other".
- tense: for a conjugated verb or a phrase built around one, the name of the tense or mood in the book's language, with the person when useful (French: "imparfait, il", "passé composé", "subjonctif présent"; English: "past simple", "present perfect"; German: "Präteritum, er", "Perfekt", "Konjunktiv II"); the participle or infinitive by its name in that language for those forms; "" for anything without a verb.
- explanation: one or two short sentences in Russian on what it means here and anything worth knowing: register (разговорное, книжное), literal meaning or origin, a common related expression, why this tense is used.`;
}

export function transcribePrompt(pageCount: number): string {
  return `${pageCount === 1 ? 'The image is a photo' : `The ${pageCount} images are photos, in order,`} of handwritten notes from a language lesson: French, English or German words and phrases, Russian translations, conjugation tables, example sentences, pronunciation in square brackets.
Transcribe every line exactly as written, top to bottom, keeping the writer's line breaks, punctuation, dashes, arrows (→) and square brackets. Keep the writer's spelling and accents; do not correct, translate or add anything. Write a word you cannot read as [?]. Leave out crossed-out text, page numbers and doodles. Separate pages with an empty line.
Reply with only a JSON object: {"title": string, "text": string}. title is what the notes are about, in English, at most 6 words; text is the transcription.`;
}

export function textbookPrompt(): string {
  return `The PDF holds a few pages from a French, English or German textbook, usually one chapter. Write the lesson notes a teacher would write from them for a Russian-speaking learner, as plain text, one item per line, using only what these pages teach:
- Vocabulary, one word per line as "word — перевод": in French nouns with le, la, l' or un/une and adjectives in the masculine form; in German nouns with der, die or das; verbs in the infinitive.
- Set phrases and expressions the same way: "phrase — перевод".
- A line "Grammaire:" (for an English textbook "Grammar:", for German "Grammatik:") followed by each grammar point of the chapter: a short rule in Russian and one or two examples.
- A line "Exemples:" ("Examples:", "Beispiele:") followed by up to 10 useful sentences from the pages, each followed by " — " and its Russian translation.
Leave out exercise instructions, answer keys, page numbers, headers and anything not in the textbook's language or about it. Do not invent content that is not on the pages.
Reply with only a JSON object: {"title": string, "text": string}. title is the chapter's topic in English, at most 6 words; text is the notes.`;
}

export interface DiscussionRequest {
  language: LearnLanguage;
  level: string;
  topic: string;
  grammar: string;
  /** the interface language: the grammar explanation is written in it */
  explainIn: 'en' | 'ru' | 'fr' | 'de';
}

const EXPLAIN_NAMES = { en: 'English', ru: 'Russian', fr: 'French', de: 'German' } as const;

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
