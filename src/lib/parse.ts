import type { Analysis, Conjugation, Form, GapItem, Lesson, Pair, VerbRef, Word } from "./types";
import { TENSES } from "./types";
import { hash, shuffle, asText } from "./util";

export function docIdFrom(input: string): string | null {
  const text = input.trim();
  // same bounds as the server, which rejects anything longer
  const match = text.match(/\/d\/([a-zA-Z0-9_-]{20,100})(?![a-zA-Z0-9_-])/);
  if (match) return match[1];
  return /^[a-zA-Z0-9_-]{20,100}$/.test(text) ? text : null;
}

export function clean(text: string): string {
  return text.replace(/\r/g, "")
    .replace(/\\([!_[\]*`#+\-.()~>|{}])/g, "$1")
    .split("\n").map(line => line.replace(/\s+$/, "")).join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Every line like "14.10.2026 1 Leçon" or "14.10.2026 1 Lesson" starts a lesson. */
export function splitLessons(text: string): Lesson[] {
  const cleaned = clean(text);
  const headingPattern = /^[ \t]*(\d{1,2})\.(\d{1,2})\.(\d{4})[ \t]+(\d+)[ \t]*(le[çc]on|lesson)\b[^\n]*$/gim;
  const marks: { i: number; end: number; d: number; mo: number; y: number; n: number; word: Lesson["word"] }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(cleaned))) marks.push({
    i: match.index, end: match.index + match[0].length, d: +match[1], mo: +match[2], y: +match[3], n: +match[4],
    word: /^lesson$/i.test(match[5]) ? "Lesson" : "Leçon",
  });
  const pad = (value: number) => String(value).padStart(2, "0");
  return marks.map((mark, index) => {
    const body = cleaned.slice(mark.end, index + 1 < marks.length ? marks[index + 1].i : cleaned.length).trim();
    return { key: `${mark.y}-${pad(mark.mo)}-${pad(mark.d)}_${mark.n}`, n: mark.n, word: mark.word, date: new Date(mark.y, mark.mo - 1, mark.d), body, hash: hash(body) };
  });
}

/** Pulls a "[bɔ̃ʒuʁ]" or "[бонжур]" transcription out of a string. */
export function splitTr(source: string): { text: string; tr: string } {
  const match = source.match(/\[([^\]]+)\]/);
  if (!match || match.index === undefined) return { text: source, tr: "" };
  const text = (source.slice(0, match.index) + " " + source.slice(match.index + match[0].length))
    .replace(/\s+/g, " ").replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, "");
  return { text, tr: match[1].trim() };
}

/** Moves a transcription Claude left in fr or ru (older cached lessons) into tr. */
export function withTr(word: Omit<Word, "tr"> & { tr?: string }): Word {
  const frenchParts = splitTr(word.fr), russianParts = splitTr(word.ru);
  return { ...word, fr: frenchParts.text || word.fr, ru: russianParts.text, tr: (word.tr || "").replace(/^\[|\]$/g, "").trim() || frenchParts.tr || russianParts.tr };
}

const CYRILLIC = /[А-Яа-яЁё]/;
/** Fallback when Claude is unavailable: "mot - перевод" lines. */
export function localParse(body: string): Analysis {
  const words: Word[] = [];
  const seen = new Set<string>();
  for (let line of body.split("\n")) {
    line = line.replace(/^\s*[-*•]\s*/, "").replace(/\*+/g, "").trim();
    const { text, tr } = splitTr(line);
    line = text;
    if (!line) continue;
    let fr = "", ru = "";
    let match = line.match(/^(.+?)\s+[-—–=]\s+(.+)$/);
    if (match && !CYRILLIC.test(match[1]) && CYRILLIC.test(match[2])) { fr = match[1]; ru = match[2]; }
    else { match = line.match(/^([^А-Яа-яЁё]+?)\s+([А-Яа-яЁё].*)$/); if (match) { fr = match[1]; ru = match[2]; } }
    fr = fr.replace(/[-—–=\s]+$/, "").trim();
    if (!fr || fr.length > 40 || /\d/.test(fr)) continue;
    const identity = fr.toLowerCase();
    if (seen.has(identity)) continue;
    seen.add(identity);
    words.push({ fr, ru: ru.trim(), kind: "other", added: false, tr });
  }
  return { language: "fr", topic: "", words, pairs: [], verbs: [], local: true };
}

type Obj = Record<string, unknown>;
const asObject = (value: unknown): Obj => (value && typeof value === "object" ? (value as Obj) : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

export function normAnalysis(raw: unknown): Analysis {
  const data = asObject(raw);
  const seen = new Set<string>();
  const words: Word[] = asArray(data.words).map(asObject)
    .map(word => withTr({ fr: asText(word.fr), ru: asText(word.ru), kind: asText(word.kind) || "other", added: !!word.added, tr: asText(word.tr) }))
    .filter(word => word.fr && !seen.has(word.fr.toLowerCase()) && !!seen.add(word.fr.toLowerCase()));
  const pairs: Pair[] = asArray(data.pairs).map(asObject)
    .map(pair => ({ a: asText(pair.a), b: asText(pair.b), kind: pair.kind === "synonym" ? "synonym" as const : "antonym" as const }))
    .filter(pair => pair.a && pair.b && pair.a !== pair.b);
  const seenVerbs = new Set<string>();
  const verbs: VerbRef[] = asArray(data.verbs).map(asObject)
    .map(verb => ({ inf: asText(verb.inf), ru: asText(verb.ru) }))
    .filter(verb => verb.inf && !seenVerbs.has(verb.inf.toLowerCase()) && !!seenVerbs.add(verb.inf.toLowerCase()));
  // An empty list is a real answer (a lesson without vocabulary); a missing one means the reply was malformed.
  if (!Array.isArray(data.words)) throw new Error("malformed");
  const language = data.language === "en" ? "en" : "fr";
  return { language, topic: asText(data.topic), words, pairs, verbs, local: false };
}

export function normConj(raw: unknown, infinitive: string): Conjugation {
  const data = asObject(raw);
  const rawTenses = asObject(data.tenses);
  const tenses = {} as Record<(typeof TENSES)[number], Form[]>;
  for (const tense of TENSES) tenses[tense] = asArray(rawTenses[tense]).map(asObject).map(form => ({ p: asText(form.p), f: asText(form.f) })).filter(form => form.f);
  if (!tenses["présent"].length) throw new Error("empty");
  return { inf: asText(data.inf) || infinitive, ru: asText(data.ru), aux: asText(data.aux), pp: asText(data.pp), tenses };
}

export function normGaps(raw: unknown): GapItem[] {
  const normalize = (text: string) => text.toLowerCase().replace(/[’']/g, "'").trim();
  const items = asArray(raw).map(asObject).map(item => {
    const answer = asText(item.answer);
    if (!answer) return null;
    const wrongOptions = [...new Set(asArray(item.options).map(asText).filter(option => option && normalize(option) !== normalize(answer)))].slice(0, 3);
    return { before: String(item.before ?? ""), after: String(item.after ?? ""), answer, word: asText(item.word), ru: asText(item.ru), choices: shuffle([answer, ...wrongOptions]) };
  }).filter((item): item is GapItem => !!item);
  if (!items.length) throw new Error("empty");
  return items;
}
