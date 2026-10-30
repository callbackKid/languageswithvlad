import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import { analysisKey, readAnalysis } from "../lib/bank";
import { localParse, normAnalysis } from "../lib/parse";
import { save } from "../lib/storage";
import type { Analysis, Lesson } from "../lib/types";
import WordsTab from "./WordsTab";
import VerbsTab from "./VerbsTab";
import Notes from "./Notes";

const longDateFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
type Tab = "words" | "verbs" | "notes" | "source";

export default function LessonView({ lesson, docId, ai, onAnalysis }: { lesson: Lesson; docId: string; ai: boolean; onAnalysis?: (lessonKey: string, analysis: Analysis) => void }) {
  const [tab, setTab] = useState<Tab>("words");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState(0);

  // Analyses are cached by the lesson text's hash: editing a lesson re-prepares it.
  useEffect(() => {
    let alive = true;
    const cached = fresh ? null : readAnalysis(lesson.hash);
    if (cached) { setAnalysis(cached); setState("ready"); return; }
    if (!ai) { setAnalysis(localParse(lesson.body)); setState("ready"); return; }
    setAnalysis(previous => previous && !previous.local ? previous : localParse(lesson.body));
    setState("loading");
    api.analyze(lesson.body, fresh > 0)
      .then(raw => {
        const prepared = normAnalysis(raw);
        save(analysisKey(lesson.hash), prepared);
        onAnalysis?.(lesson.key, prepared);
        if (alive) { setAnalysis(prepared); setState("ready"); }
      })
      .catch(failure => { if (alive) { setState("error"); setError(failure instanceof ApiError ? failure.message : "The answer couldn’t be read. Try again."); } });
    return () => { alive = false; };
  }, [lesson.hash, lesson.key, lesson.body, ai, fresh, onAnalysis]);

  // Words carry their lesson so progress and stats can group by lesson.
  const tagged = useMemo(() => analysis && { ...analysis, words: analysis.words.map(word => ({ ...word, lesson: lesson.key, language: analysis.language })) }, [analysis, lesson.key]);

  const tabBtn = (id: Tab, label: string, count?: number) => (
    <button className="tab" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
      {label}{count !== undefined && <span className="count">{count}</span>}
    </button>
  );

  let note = null;
  if (state === "loading") note = <div className="note info"><span className="spinner" /><p>Reading this lesson and preparing words, pairs and verbs…</p></div>;
  else if (state === "error") note = <div className="note err"><p>{error}</p><button className="btn" onClick={() => setFresh(previous => previous + 1)}>Try again</button></div>;
  else if (analysis?.local) note = <div className="note info"><p>Showing words exactly as written in the notes. Translations, pairs, verbs and sentences need Claude.</p></div>;

  return (
    <>
      <section className="sheet">
        <h1>{lesson.word} {lesson.n}</h1>
        <p className="date">{longDateFormat.format(lesson.date)}</p>
        {analysis?.topic && <p className="topic">{analysis.topic}</p>}
      </section>
      <section className="panel">
        <div className="tabs" role="tablist">
          {tabBtn("words", "Words", analysis?.words.length ?? 0)}
          {tabBtn("verbs", "Verbs", analysis?.verbs.length ?? 0)}
          {tabBtn("notes", "My notes")}
          {tabBtn("source", "Original")}
        </div>
        <div className="body">
          {(tab === "words" || tab === "verbs") && note}
          {tab === "words" && tagged && <WordsTab key={lesson.hash + (tagged.local ? "l" : "c")} analysis={tagged} ai={ai && !tagged.local}
            onRefresh={ai && state === "ready" && !tagged.local ? () => setFresh(previous => previous + 1) : undefined} />}
          {tab === "verbs" && analysis?.language === "en" && <p className="empty">Verb tables are only available for French lessons for now.</p>}
          {tab === "verbs" && analysis && analysis.language !== "en" && <VerbsTab key={lesson.hash} verbs={analysis.verbs} ai={ai && !analysis.local} waiting={state === "loading"} />}
          {tab === "notes" && <Notes storageKey={`notes:${docId}:${lesson.key}`} />}
          {tab === "source" && <pre className="source">{lesson.body}</pre>}
        </div>
      </section>
    </>
  );
}
