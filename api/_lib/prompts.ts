export function analysisPrompt(body: string): string {
  return `You are helping a Russian-speaking beginner (A1) learn a foreign language, French or English. Below are raw notes from one lesson, written by the teacher in that language and Russian. They are messy: some words have no translation, and some lines are conjugation tables, example sentences or pronunciation rules.

First decide which language the lesson teaches, judging by its vocabulary rather than by headings or labels (an English lesson may still be headed "leçon"): "fr" for French, "en" for English.

Reply with only a JSON object of this shape:
{"language": "fr"|"en", "topic": string, "words": [{"fr": string, "ru": string, "tr": string, "kind": "noun"|"verb"|"adjective"|"adverb"|"expression"|"other", "added": boolean}], "pairs": [{"a": string, "b": string, "kind": "synonym"|"antonym"}], "verbs": [{"inf": string, "ru": string}]}

Rules:
- topic: what the lesson covered, in English, at most 12 words.
- words: every word or short expression in the lesson's language that the lesson teaches (vocabulary, greetings, question words, set phrases). fr always holds the word being learned, even when the language is English. For French, write nouns with an article (le, la, l', un, une) when the gender is known; for English, write nouns without an article and verbs without "to". Correct obvious spelling mistakes. ru is a short Russian translation: use the teacher's translation when there is one; otherwise write your own and set added to true. tr is the pronunciation the teacher wrote for the word (usually in square brackets, in Cyrillic or IPA), copied without the brackets; never put it inside fr or ru, and use "" when the notes give none. Skip lines that only show a conjugated form from a verb table, pronunciation rules, numbers written as digits, and words in any other language. Never repeat the same fr.
- pairs: 4 to 12 synonym or antonym pairs where both a and b are exact fr values from words. Use pairs the teacher noted first (for example facile / difficile), then obvious ones among the lesson's words. Return [] if there are none.
- verbs: for a French lesson, every verb in the infinitive, including reflexive ones (se raser) and verbs the lesson conjugates; ru is a short Russian translation. For an English lesson, return [].

Lesson notes:
"""
${body.slice(0, 14000)}
"""`;
}

export function conjPrompt(infinitive: string, ru: string): string {
  return `Conjugate the French verb "${infinitive}"${ru ? ` (Russian meaning: ${ru})` : ""}.
Reply with only a JSON object:
{"inf": string, "ru": string, "aux": "avoir"|"être", "pp": string, "tenses": {"présent": [..6], "passé composé": [..6], "imparfait": [..6], "futur simple": [..6], "conditionnel présent": [..6], "impératif": [..3]}}
Each item is {"p": string, "f": string}. For the six persons p is "je" (or "j'" before a vowel or mute h), "tu", "il/elle/on", "nous", "vous", "ils/elles", and f is the rest of the form. For reflexive verbs the reflexive pronoun goes in f (p "je", f "me rase"; passé composé f "me suis rasé(e)"). With the auxiliary être, show participle agreement as (e), (s) or (e)s. For impératif p is "tu", "nous", "vous" and f is the imperative (with -toi, -nous, -vous for reflexive verbs); use [] if the verb has no imperative. pp is the past participle, ru a short Russian translation.`;
}

export function gapPrompt(words: { fr: string; ru: string }[], count: number, language: "fr" | "en"): string {
  const list = words.map(word => `- ${word.fr} = ${word.ru}`).join("\n");
  return `Write ${count} short, simple ${language === "en" ? "English" : "French"} sentences (A1 level) for a Russian-speaking beginner. Each sentence uses one word from the list below, and that word is the gap to fill. Use each word at most once; reuse words only if the list is shorter than ${count}. The gapped text is the exact form the word takes in the sentence (conjugated verb, agreed adjective, article included for nouns if natural).
Reply with only a JSON array of objects: {"before": string, "after": string, "answer": string, "word": string, "ru": string, "options": [string, string, string]}. before and after are the text around the gap, answer the gapped text, word the list entry it comes from, ru a Russian translation of the whole sentence, options three plausible wrong answers of the same kind (other forms or other words from the list).

Words:
${list}`;
}
