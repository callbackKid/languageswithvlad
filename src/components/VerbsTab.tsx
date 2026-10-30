import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../lib/api";
import { grade, type Grade } from "../lib/grade";
import { conjKey, readConj } from "../lib/bank";
import { normConj } from "../lib/parse";
import { recordForm } from "../lib/progress";
import { save } from "../lib/storage";
import { TENSES, type Conjugation, type Tense, type VerbRef } from "../lib/types";
import { plural, shuffle } from "../lib/util";
import ExHead from "./ExHead";

export default function VerbsTab({ verbs, ai, waiting }: { verbs: VerbRef[]; ai: boolean; waiting: boolean }) {
  const [currentVerb, setCurrentVerb] = useState<string | null>(null);
  const [tense, setTense] = useState<Tense>("présent");
  const [conjugations, setConjugations] = useState<Record<string, Conjugation>>(() => {
    const out: Record<string, Conjugation> = {};
    for (const verb of verbs) { const conjugation = readConj(verb.inf); if (conjugation) out[verb.inf] = conjugation; }
    return out;
  });
  const [status, setStatus] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"table" | "drill" | "quiz">("table");

  async function open(verb: VerbRef) {
    setCurrentVerb(verb.inf); setMode("table");
    if (conjugations[verb.inf] || status[verb.inf] === "loading") return;
    const cached = readConj(verb.inf);
    if (cached) { setConjugations(previous => ({ ...previous, [verb.inf]: cached })); return; }
    if (!ai) { setStatus(previous => ({ ...previous, [verb.inf]: "Conjugation tables need Claude, which isn’t set up on this server." })); return; }
    setStatus(previous => ({ ...previous, [verb.inf]: "loading" }));
    try {
      const conjugation = normConj(await api.conjugate(verb.inf, verb.ru), verb.inf);
      save(conjKey(verb.inf), conjugation);
      setConjugations(previous => ({ ...previous, [verb.inf]: conjugation }));
      setStatus(previous => { const copy = { ...previous }; delete copy[verb.inf]; return copy; });
    } catch (error) {
      setStatus(previous => ({ ...previous, [verb.inf]: error instanceof ApiError ? error.message : "The answer couldn’t be read. Try again." }));
    }
  }

  if (!verbs.length) return waiting ? null : <p className="empty">{ai ? "No verbs found in this lesson." : "Verb tables need Claude, which isn’t set up on this server."}</p>;
  const loaded = verbs.filter(verb => conjugations[verb.inf]);

  if (mode === "quiz") return <Quiz conjugations={loaded.map(verb => conjugations[verb.inf])} onClose={() => setMode("table")} />;

  const shownConjugation = currentVerb ? conjugations[currentVerb] : null;
  const shownStatus = currentVerb ? status[currentVerb] : undefined;
  const rows = shownConjugation ? shownConjugation.tenses[tense] || [] : [];

  return (
    <>
      <div className="verbs">
        {verbs.map(verb => (
          <button key={verb.inf} className="verb" aria-pressed={currentVerb === verb.inf} onClick={() => open(verb)}>
            <span className="fr" lang="fr">{verb.inf}</span><span className="ru" lang="ru">{verb.ru}</span>
          </button>
        ))}
      </div>
      <div className="row-actions quiz-bar">
        <button className="btn" disabled={!loaded.length} onClick={() => setMode("quiz")}>Quick quiz</button>
        <span className="hint">{loaded.length ? `Uses the ${plural(loaded.length, "verb")} you’ve opened` : "Open a verb to add it to the quiz"}</span>
      </div>

      {!currentVerb && <p className="empty">Pick a verb to see its conjugation.</p>}
      {shownStatus === "loading" && <p><span className="spinner" /> Conjugating <i lang="fr">{currentVerb}</i>…</p>}
      {shownStatus && shownStatus !== "loading" && <div className="note err"><p>{shownStatus}</p><button className="btn" onClick={() => { const verb = verbs.find(candidate => candidate.inf === currentVerb); if (verb) { setStatus(previous => { const copy = { ...previous }; delete copy[verb.inf]; return copy; }); void open(verb); } }}>Try again</button></div>}

      {shownConjugation && <>
        <div className="conj-head"><h2 lang="fr">{shownConjugation.inf}</h2><span className="ru" lang="ru">{shownConjugation.ru}</span></div>
        <p className="conj-meta">
          {shownConjugation.pp && <>Past participle <i lang="fr">{shownConjugation.pp}</i></>}{shownConjugation.aux && <>, passé composé with <i lang="fr">{shownConjugation.aux}</i></>}
        </p>
        <div className="tense-tabs" role="group" aria-label="Tense">
          {TENSES.map(tenseOption => (
            <button key={tenseOption} aria-pressed={tense === tenseOption} disabled={!(shownConjugation.tenses[tenseOption] || []).length} onClick={() => setTense(tenseOption)}>{tenseOption}</button>
          ))}
        </div>
        {!rows.length ? <p className="empty">This verb has no {tense}.</p>
          : mode === "drill" ? <Drill key={shownConjugation.inf + tense} inf={shownConjugation.inf} tense={tense} rows={rows} onStop={() => setMode("table")} />
          : <>
              <table className="conj" lang="fr"><tbody>
                {rows.map((row, index) => <tr key={index}><td className="p">{row.p}</td><td className="f">{row.f}</td></tr>)}
              </tbody></table>
              <div className="row-actions"><button className="btn primary" onClick={() => setMode("drill")}>Practise this tense</button></div>
            </>}
      </>}
    </>
  );
}

function Drill({ inf, tense, rows, onStop }: { inf: string; tense: Tense; rows: { p: string; f: string }[]; onStop: () => void }) {
  const [values, setValues] = useState<string[]>(() => rows.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [round, setRound] = useState(0);
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => { first.current?.focus(); }, [round]);

  const results: Grade[] = checked ? rows.map((row, index) => grade(values[index], row.f, row.p)) : [];
  const score = results.filter(result => result === "ok").length;

  return (
    <form onSubmit={event => {
      event.preventDefault();
      setChecked(true);
      // blank rows and accent slips don't count either way
      rows.forEach((row, index) => { const result = grade(values[index], row.f, row.p); if (result === "ok" || result === "bad") recordForm(inf, tense, row.p, row.f, result === "ok"); });
    }}>
      <table className="conj" lang="fr"><tbody>
        {rows.map((row, index) => {
          const result = results[index];
          const inputClass = result === "empty" ? "bad" : result || "";
          return (
            <tr key={index}>
              <td className="p">{row.p}</td>
              <td>
                <input ref={index === 0 ? first : undefined} className={inputClass} value={values[index]} aria-label={row.p}
                  autoComplete="off" autoCapitalize="off" spellCheck={false} readOnly={checked}
                  onChange={event => setValues(previous => previous.map((value, position) => (position === index ? event.target.value : value)))}
                  onKeyDown={event => {
                    if (event.key === "Enter" && index < rows.length - 1) {
                      event.preventDefault();
                      (event.currentTarget.closest("tbody")?.querySelectorAll("input")[index + 1] as HTMLInputElement | undefined)?.focus();
                    }
                  }} />
                {(result === "bad" || result === "empty") && <div className="fix bad">{row.f}</div>}
                {result === "accent" && <div className="fix accent">Mind the accents: {row.f}</div>}
              </td>
            </tr>
          );
        })}
      </tbody></table>
      <div className="row-actions">
        {checked
          ? <><span className="score">{score} of {rows.length} right</span>
              <button type="button" className="btn primary" onClick={() => { setValues(rows.map(() => "")); setChecked(false); setRound(previous => previous + 1); }}>Try again</button></>
          : <button type="submit" className="btn primary">Check answers</button>}
        <button type="button" className="btn ghost" onClick={onStop}>Show table</button>
      </div>
    </form>
  );
}

interface Q { inf: string; t: Tense; p: string; f: string }
function makeQuiz(conjugations: Conjugation[]): Q[] {
  const questions: Q[] = [];
  for (const conjugation of conjugations) for (const tense of TENSES) for (const form of conjugation.tenses[tense] || []) questions.push({ inf: conjugation.inf, t: tense, p: form.p, f: form.f });
  return shuffle(questions).slice(0, 10);
}

function Quiz({ conjugations, onClose }: { conjugations: Conjugation[]; onClose: () => void }) {
  const [questions, setQuestions] = useState(() => makeQuiz(conjugations));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, [index]);

  const head = (
    <ExHead title="Quick quiz" onClose={onClose} closeLabel="Back to verbs">
      <span className="progress">{Math.min(index + 1, questions.length)} / {questions.length}</span>
    </ExHead>
  );
  if (index >= questions.length) return (
    <div className="ex">{head}
      <p className="score">{score} of {questions.length} right.</p>
      <div className="row-actions"><button className="btn primary" onClick={() => { setQuestions(makeQuiz(conjugations)); setIndex(0); setScore(0); setTyped(""); setResult(null); }}>New quiz</button></div>
    </div>
  );
  const question = questions[index];
  const next = () => { setIndex(previous => previous + 1); setTyped(""); setResult(null); };
  return (
    <div className="ex">{head}
      <p className="quiz-q"><b lang="fr">{question.inf}</b>, {question.t}</p>
      <form className="quiz-input" onSubmit={event => {
        event.preventDefault();
        if (result) return next();
        const grading = grade(typed, question.f, question.p);
        if (grading === "empty") return;
        setResult(grading);
        if (grading === "ok") setScore(previous => previous + 1);
        if (grading === "ok" || grading === "bad") recordForm(question.inf, question.t, question.p, question.f, grading === "ok");
      }}>
        <span className="p" lang="fr">{question.p}</span>
        <input ref={input} lang="fr" value={typed} onChange={event => setTyped(event.target.value)} readOnly={!!result}
          autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Your answer" />
        <button className="btn primary" type="submit">{result ? "Next" : "Check"}</button>
      </form>
      {result === "ok" && <p className="feedback ok">Right.</p>}
      {result === "accent" && <p className="feedback warn">Almost, mind the accents: <b lang="fr">{question.p} {question.f}</b></p>}
      {result === "bad" && <p className="feedback bad">The answer is <b lang="fr">{question.p} {question.f}</b></p>}
    </div>
  );
}
