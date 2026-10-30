import { useEffect, useRef, useState } from "react";
import { grade } from "../lib/grade";
import { recordForm, recordWord } from "../lib/progress";
import type { QItem } from "../lib/quiz";
import { LANGUAGE_NAMES } from "../lib/types";
import ExHead from "./ExHead";
import Transcription from "./Transcription";

type Result = "ok" | "bad" | "accent" | "article";
const ARTICLE = /^(le|la|les|un|une|des|l')\s*/i;

function gradeWord(typed: string, answer: string): Result | null {
  const result = grade(typed, answer);
  if (result === "empty") return null;
  if (result !== "bad") return result;
  const bare = answer.replace(ARTICLE, "");
  return bare !== answer && grade(typed, bare) !== "bad" ? "article" : "bad";
}

/** A run of mixed questions; make() builds the next round. */
export default function WordQuiz({ title, make, onClose, closeLabel, empty }: {
  title: string; make: () => QItem[]; onClose?: () => void; closeLabel?: string; empty?: string;
}) {
  const [questions, setQuestions] = useState(make);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { input.current?.focus(); }, [index]);
  useEffect(() => { if (result) nextButton.current?.focus(); }, [result]);

  const restart = () => { setQuestions(make()); setIndex(0); setScore(0); setTyped(""); setPicked(null); setResult(null); };
  const next = () => { setIndex(previous => previous + 1); setTyped(""); setPicked(null); setResult(null); };
  const head = (
    <ExHead title={title} onClose={onClose} closeLabel={closeLabel}>
      {questions.length > 0 && <span className="progress">{Math.min(index + 1, questions.length)} / {questions.length}</span>}
    </ExHead>
  );
  const shell = (body: React.ReactNode) => <div className="ex">{head}{body}</div>;

  if (!questions.length) return shell(<p className="empty">{empty || "Nothing to practise yet."}</p>);
  if (index >= questions.length) return shell(<>
    <p className="score">{score} of {questions.length} right.</p>
    <div className="row-actions"><button className="btn primary" autoFocus onClick={restart}>Next round</button></div>
  </>);

  const question = questions[index];
  const finish = (outcome: Result) => {
    setResult(outcome);
    if (outcome === "ok") setScore(previous => previous + 1);
    // near misses show the right form without counting against the student
    if (outcome === "ok" || outcome === "bad") {
      if (question.kind === "form") recordForm(question.form.inf, question.form.t, question.form.p, question.form.f, outcome === "ok");
      else recordWord(question.word, outcome === "ok");
    }
  };
  // verb forms are French only; words carry the language of their lesson
  const language = question.kind === "form" ? "fr" : question.word.language ?? "fr";
  const answer = question.kind === "form" ? `${question.form.p} ${question.form.f}` : question.kind === "pick-ru" ? question.word.ru : question.word.fr;
  const feedback = result && (
    <>
      {result === "ok" && <p className="feedback ok">Right.</p>}
      {result === "accent" && <p className="feedback warn">Almost, mind the accents: <b lang={language}>{answer}</b></p>}
      {result === "article" && <p className="feedback warn">Almost, don’t forget the article: <b lang={language}>{answer}</b></p>}
      {result === "bad" && <p className="feedback bad">The answer is <b lang={question.kind === "pick-ru" ? "ru" : language}>{answer}</b>
        {question.kind !== "form" && question.kind !== "pick-ru" && question.word.tr && <> <Transcription tr={question.word.tr} /></>}</p>}
      <div className="row-actions">
        <button ref={nextButton} className="btn primary" onClick={next}>{index + 1 < questions.length ? "Next" : "See score"}</button>
      </div>
    </>
  );

  if (question.kind === "pick-ru" || question.kind === "pick-fr") {
    const right = question.kind === "pick-ru" ? question.word.ru : question.word.fr;
    return shell(<>
      {question.kind === "pick-ru"
        ? <p className="quiz-word"><span lang={language}>{question.word.fr}</span>{question.word.tr && <Transcription tr={question.word.tr} />}</p>
        : <p className="quiz-word ru" lang="ru">{question.word.ru}</p>}
      <p className="ru-line">{question.kind === "pick-ru" ? "Pick the translation." : `Pick the ${LANGUAGE_NAMES[language]} word.`}</p>
      <div className="choices">
        {question.choices.map(choice => {
          const stateClass = picked == null ? "" : choice === right ? " ok" : choice === picked ? " bad" : "";
          return <button key={choice} className={"choice" + stateClass + (question.kind === "pick-ru" ? " ru" : "")} lang={question.kind === "pick-ru" ? "ru" : language}
            disabled={picked != null} onClick={() => { setPicked(choice); finish(choice === right ? "ok" : "bad"); }}>{choice}</button>;
        })}
      </div>
      {feedback}
    </>);
  }

  const check = (event: React.FormEvent) => {
    event.preventDefault();
    if (result) return next();
    const grading = question.kind === "form" ? grade(typed, question.form.f, question.form.p) : gradeWord(typed, question.word.fr);
    if (grading && grading !== "empty") finish(grading);
  };
  return shell(<>
    {question.kind === "form"
      ? <p className="quiz-q"><b lang="fr">{question.form.inf}</b>, {question.form.t}</p>
      : <><p className="quiz-word ru" lang="ru">{question.word.ru}</p><p className="ru-line">Type it in {LANGUAGE_NAMES[language]}.</p></>}
    <form className="quiz-input" onSubmit={check}>
      {question.kind === "form" && <span className="p" lang="fr">{question.form.p}</span>}
      <input ref={input} lang={language} value={typed} onChange={event => setTyped(event.target.value)} readOnly={!!result}
        autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Your answer" />
      {!result && <button className="btn primary" type="submit">Check</button>}
    </form>
    {feedback}
  </>);
}
