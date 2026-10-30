import { useMemo } from "react";
import type { Bank } from "../lib/bank";
import { isLearned, topMistakes, useProgress, wordKey } from "../lib/progress";
import { plural } from "../lib/util";
import MistakeList from "./MistakeList";
import PageHead, { BankNote } from "./PageHead";

/** Fewer answers than this say too little about a topic to call it weak. */
const MIN_ANSWERS = 4;
const KINDS: Record<string, string> = {
  noun: "Nouns", verb: "Verbs", adjective: "Adjectives", adverb: "Adverbs", expression: "Expressions", other: "Other words",
};

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const share = percent(value, max);
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label} title={`${label}: ${value} of ${max} (${share}%)`}>
      <div className="meter-fill" style={{ width: share + "%" }} />
    </div>
  );
}

interface Row { id: string; name: string; right: number; total: number }
function addTo(rowsById: Map<string, Row>, id: string, name: string, right: number, wrong: number) {
  const row = rowsById.get(id) || { id, name, right: 0, total: 0 };
  row.right += right; row.total += right + wrong;
  rowsById.set(id, row);
}

/** Lowest accuracy first, leaving out topics with too few answers to judge. */
const weakest = (rowsById: Map<string, Row>) => [...rowsById.values()].filter(row => row.total >= MIN_ANSWERS).sort((first, second) => first.right / first.total - second.right / second.total);

function RankList({ title, rows }: { title: string; rows: Row[] }) {
  if (!rows.length) return null;
  return (
    <div className="rank">
      <h3>{title}</h3>
      <ul>
        {rows.map(row => (
          <li key={row.id}>
            <span className="rank-name">{row.name}</span>
            <Meter value={row.right} max={row.total} label={`${row.name}, right answers`} />
            <span className="rank-val">{percent(row.right, row.total)}%<span className="rank-n"> of {row.total}</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Stats({ bank }: { bank: Bank }) {
  const progress = useProgress();
  const { total, learned, right, answers, hard, perLesson, tenses, weakLessons, weakKinds, topWords, topForms } = useMemo(() => {
    const total = bank.words.length;
    const learned = bank.words.filter(word => isLearned(progress.words[wordKey(word.fr)])).length;
    const stats = Object.values(progress.words);
    const right = stats.reduce((sum, wordStat) => sum + wordStat.right, 0) + Object.values(progress.forms).reduce((sum, formStat) => sum + formStat.right, 0);
    const answers = right + stats.reduce((sum, wordStat) => sum + wordStat.wrong, 0) + Object.values(progress.forms).reduce((sum, formStat) => sum + formStat.wrong, 0);
    const hard = stats.filter(stat => stat.hard).length;

    // Per-lesson progress: words learned out of the lesson's words.
    const perLesson = bank.lessons.filter(lesson => lesson.ready).map(lesson => {
      const lessonWords = bank.words.filter(word => word.lesson === lesson.key);
      return { ...lesson, total: lessonWords.length, learned: lessonWords.filter(word => isLearned(progress.words[wordKey(word.fr)])).length };
    }).filter(lesson => lesson.total > 0);

    // Weak topics: accuracy by lesson, by kind of word and by tense.
    const byLesson = new Map<string, Row>(), byKind = new Map<string, Row>(), byTense = new Map<string, Row>();
    const lessonName = new Map(bank.lessons.map(lesson => [lesson.key, `${lesson.word} ${lesson.n}${lesson.topic ? `: ${lesson.topic}` : ""}`]));
    for (const stat of stats) {
      if (stat.lesson && lessonName.has(stat.lesson)) addTo(byLesson, stat.lesson, lessonName.get(stat.lesson)!, stat.right, stat.wrong);
      addTo(byKind, stat.kind, KINDS[stat.kind] || KINDS.other, stat.right, stat.wrong);
    }
    for (const formStat of Object.values(progress.forms)) addTo(byTense, formStat.t, formStat.t, formStat.right, formStat.wrong);
    const tenses = weakest(byTense);
    const weakLessons = weakest(byLesson).slice(0, 5), weakKinds = weakest(byKind);
    const { words: topWords, forms: topForms } = topMistakes(progress);
    return { total, learned, right, answers, hard, perLesson, tenses, weakLessons, weakKinds, topWords, topForms };
  }, [bank.words, bank.lessons, progress]);

  return (
    <>
      <PageHead title="Stats">{answers ? `Based on ${plural(answers, "answer")} in exercises.` : null}</PageHead>
      <BankNote bank={bank} />

      <div className="kpis">
        <div className="kpi"><span className="kpi-label">Words learned</span><span className="kpi-value">{learned}</span></div>
        <div className="kpi"><span className="kpi-label">Left to learn</span><span className="kpi-value">{Math.max(total - learned, 0)}</span></div>
        <div className="kpi"><span className="kpi-label">Right answers</span><span className="kpi-value">{answers ? percent(right, answers) + "%" : "—"}</span></div>
        <div className="kpi"><span className="kpi-label">On My words</span><span className="kpi-value">{hard}</span></div>
      </div>

      <section className="panel solo stats-block">
        <div className="body">
          <div className="meter-head">
            <h2 className="sub-h">Vocabulary</h2>
            <span className="hint">{learned} of {plural(total, "word")} learned ({percent(learned, total)}%)</span>
          </div>
          <Meter value={learned} max={total} label="Words learned" />
          <p className="legend">A word counts as learned after 3 right answers in a row.</p>
          {perLesson.length > 0 && <ul className="lesson-progress">
            {perLesson.map(lesson => (
              <li key={lesson.key}>
                <span className="rank-name">{lesson.word} {lesson.n}{lesson.topic && <span className="topic-small"> · {lesson.topic}</span>}</span>
                <Meter value={lesson.learned} max={lesson.total} label={`${lesson.word} ${lesson.n}, words learned`} />
                <span className="rank-val">{lesson.learned}<span className="rank-n"> / {lesson.total}</span></span>
              </li>
            ))}
          </ul>}
        </div>
      </section>

      <section className="panel solo stats-block">
        <div className="body">
          <h2 className="sub-h">Weak topics</h2>
          {weakLessons.length || weakKinds.length || tenses.length
            ? <div className="rank-cols">
                <RankList title="Lessons" rows={weakLessons} />
                <RankList title="Kinds of words" rows={weakKinds} />
                <RankList title="Tenses" rows={tenses} />
              </div>
            : <p className="empty">Not enough answers yet. Topics show up here once you’ve answered at least {MIN_ANSWERS} questions on them.</p>}
          {(weakLessons.length > 0 || weakKinds.length > 0 || tenses.length > 0) && <p className="legend">Share of right answers, weakest first.</p>}
        </div>
      </section>

      <section className="panel solo stats-block">
        <div className="body">
          <h2 className="sub-h">Most common mistakes</h2>
          {topWords.length || topForms.length
            ? <MistakeList words={topWords.slice(0, 6)} forms={topForms.slice(0, 4)} />
            : <p className="empty">No mistakes recorded yet.</p>}
        </div>
      </section>
    </>
  );
}
