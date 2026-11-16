import { useEffect, useMemo, useState } from 'react';

import { translator, useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { paper } from '../i18n/messages/paper';
import { api, ApiError } from '../lib/api';
import { analysisKey, readAnalysis } from '../lib/bank';
import { localParse, normalizeAnalysis } from '../lib/parse';
import { save } from '../lib/storage';
import type { Analysis, Lesson } from '../lib/types';
import Notes from './Notes';
import VerbsTab from './VerbsTab';
import WaitingFact from './WaitingFact';
import WordsTab from './WordsTab';

type Tab = 'words' | 'verbs' | 'notes' | 'source';

export default function LessonView({
  lesson,
  docId,
  ai,
  onAnalysis,
}: {
  lesson: Lesson;
  docId: string;
  ai: boolean;
  onAnalysis?: (lessonKey: string, analysis: Analysis) => void;
}) {
  const { t, locale } = useTranslation(paper);
  const commonText = useTranslation(common);
  const [tab, setTab] = useState<Tab>('words');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [fresh, setFresh] = useState(0);

  // Analyses are cached by the lesson text's hash: editing a lesson re-prepares it.
  useEffect(() => {
    let alive = true;
    const cached = fresh ? null : readAnalysis(lesson.hash);
    if (cached) {
      setAnalysis(cached);
      setState('ready');
      return;
    }
    if (!ai) {
      setAnalysis(localParse(lesson.body));
      setState('ready');
      return;
    }
    setAnalysis((previous) => (previous && !previous.local ? previous : localParse(lesson.body)));
    setState('loading');
    api
      .analyze(lesson.body, fresh > 0)
      .then((raw) => {
        const prepared = normalizeAnalysis(raw);
        save(analysisKey(lesson.hash), prepared);
        onAnalysis?.(lesson.key, prepared);
        if (alive) {
          setAnalysis(prepared);
          setState('ready');
        }
      })
      .catch((failure) => {
        if (alive) {
          setState('error');
          // read at the moment of failure, so the effect doesn't depend on the language
          setError(
            failure instanceof ApiError ? failure.message : translator(common).t('unreadable')
          );
        }
      });
    return () => {
      alive = false;
    };
  }, [lesson.hash, lesson.key, lesson.body, ai, fresh, onAnalysis]);

  // Words carry their lesson so progress and stats can group by lesson.
  const tagged = useMemo(
    () =>
      analysis && {
        ...analysis,
        words: analysis.words.map((word) => ({
          ...word,
          lesson: lesson.key,
          language: analysis.language,
        })),
      },
    [analysis, lesson.key]
  );

  const tabButton = (id: Tab, label: string, count?: number) => (
    <button
      type="button"
      className="tab"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
    >
      {label}
      {count !== undefined && <span className="count">{count}</span>}
    </button>
  );

  let note = null;
  if (state === 'loading')
    note = <WaitingFact language={analysis?.language}>{t('preparing')}</WaitingFact>;
  else if (state === 'error')
    note = (
      <div className="note err">
        <p>{error}</p>
        <button type="button" className="btn" onClick={() => setFresh((previous) => previous + 1)}>
          {commonText.t('tryAgain')}
        </button>
      </div>
    );
  else if (analysis?.local)
    note = (
      <div className="note info">
        <p>{t('localOnly')}</p>
      </div>
    );

  return (
    <>
      <section className="sheet">
        <h1>{lesson.title || `${lesson.word} ${lesson.n}`}</h1>
        <p className="date">
          {new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(lesson.date)}
        </p>
        {analysis?.topic && <p className="topic">{analysis.topic}</p>}
      </section>
      <section className="panel">
        <div className="tabs" role="tablist">
          {tabButton('words', t('words'), analysis?.words.length ?? 0)}
          {tabButton('verbs', t('verbs'), analysis?.verbs.length ?? 0)}
          {tabButton('notes', t('myNotes'))}
          {tabButton('source', t('original'))}
        </div>
        <div className="body">
          {(tab === 'words' || tab === 'verbs') && note}
          {tab === 'words' && tagged && (
            <WordsTab
              key={lesson.hash + (tagged.local ? 'l' : 'c')}
              analysis={tagged}
              ai={ai && !tagged.local}
              onRefresh={
                ai && state === 'ready' && !tagged.local
                  ? () => setFresh((previous) => previous + 1)
                  : undefined
              }
            />
          )}
          {tab === 'verbs' && analysis && analysis.language !== 'fr' && (
            <p className="empty">{t('frenchOnlyVerbs')}</p>
          )}
          {tab === 'verbs' && analysis?.language === 'fr' && (
            <VerbsTab
              key={lesson.hash}
              verbs={analysis.verbs}
              ai={ai && !analysis.local}
              waiting={state === 'loading'}
            />
          )}
          {tab === 'notes' && <Notes storageKey={`notes:${docId}:${lesson.key}`} />}
          {tab === 'source' && <pre className="source">{lesson.body}</pre>}
        </div>
      </section>
    </>
  );
}
