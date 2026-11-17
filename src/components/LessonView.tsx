import { useEffect, useMemo, useState } from 'react';

import { getUiLanguage, translator, useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { paper } from '../i18n/messages/paper';
import { api, ApiError } from '../lib/api';
import { analysisKey, readAnalysis } from '../lib/bank';
import { homeworkKey } from '../lib/homework';
import { localParse, markKeyWords, normalizeAnalysis, normalizeExtras } from '../lib/parse';
import { LESSON_TABS, type LessonTab, useSettings } from '../lib/settings';
import { load, save } from '../lib/storage';
import type { Analysis, Lesson, LessonExtras } from '../lib/types';
import HelpLink from './HelpLink';
import LessonDrawings from './LessonDrawings';
import { BookTab, GrammarTab, HomeworkTab } from './LessonExtrasTabs';
import MakeHomework from './MakeHomework';
import Notes from './Notes';
import VerbsTab from './VerbsTab';
import WaitingFact from './WaitingFact';
import WordsTab from './WordsTab';

type Tab = LessonTab;
const EXTRA_TABS: Tab[] = ['grammar', 'homework', 'book'];

export default function LessonView({
  lesson,
  docId,
  ai,
  docWriter,
  onAnalysis,
}: {
  lesson: Lesson;
  docId: string;
  ai: boolean;
  /** whether the server can write to this document (to add exercises from the book); left out
      for a lesson that isn't in the document */
  docWriter?: boolean;
  onAnalysis?: (lessonKey: string, analysis: Analysis) => void;
}) {
  const { t, locale, language: uiLanguage } = useTranslation(paper);
  const commonText = useTranslation(common);
  const { hiddenTabs } = useSettings();
  const shownTabs = LESSON_TABS.filter((id) => !hiddenTabs.includes(id));
  const [chosenTab, setTab] = useState<Tab>('words');
  // a tab hidden in Settings gives way to the first one shown
  const tab = shownTabs.includes(chosenTab) ? chosenTab : (shownTabs[0] ?? 'words');
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

  // The grammar, homework and book exercises: read once, the first time one of their tabs is
  // opened, and kept for this lesson text and interface language.
  const extrasKey = `extras:${lesson.hash}:${uiLanguage}`;
  const [extras, setExtras] = useState<LessonExtras | null>(() => load<LessonExtras>(extrasKey));
  const [extrasState, setExtrasState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [freshExtras, setFreshExtras] = useState(0);
  const wantsExtras = EXTRA_TABS.includes(tab);
  useEffect(() => {
    const cached = freshExtras ? null : load<LessonExtras>(extrasKey);
    setExtras(cached);
    setExtrasState('idle');
    if (cached || !wantsExtras || !ai) return;
    let alive = true;
    setExtrasState('loading');
    api
      .lessonExtras(lesson.body, getUiLanguage(), freshExtras > 0)
      .then((raw) => {
        const read = normalizeExtras(raw);
        save(extrasKey, read);
        if (alive) {
          setExtras(read);
          setExtrasState('idle');
        }
      })
      .catch(() => {
        if (alive) setExtrasState('error');
      });
    return () => {
      alive = false;
    };
  }, [extrasKey, lesson.body, wantsExtras, ai, freshExtras]);

  // Words carry their lesson so progress and stats can group by lesson.
  const tagged = useMemo(
    () =>
      analysis && {
        ...analysis,
        words: markKeyWords(analysis.words, lesson.body).map((word) => ({
          ...word,
          lesson: lesson.key,
          language: analysis.language,
        })),
      },
    [analysis, lesson.key, lesson.body]
  );

  const tabButton = (id: Tab, label: string, count?: number) =>
    shownTabs.includes(id) && (
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
        <div className="title-row">
          <h1>{lesson.title || `${lesson.word} ${lesson.n}`}</h1>
          <HelpLink guide={tab === 'verbs' ? 'verbs' : 'lessons'} />
        </div>
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
          {tabButton('grammar', t('grammar'), extras?.grammar.length)}
          {tabButton('homework', t('homework'), extras?.homework.length)}
          {tabButton('book', t('book'), extras?.book.length)}
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
          {wantsExtras && !ai && !extras && <p className="empty">{commonText.t('needsClaude')}</p>}
          {wantsExtras && extrasState === 'loading' && (
            <WaitingFact language={analysis?.language}>{t('readingExtras')}</WaitingFact>
          )}
          {wantsExtras && extrasState === 'error' && (
            <div className="note err">
              <p>{commonText.t('unreadable')}</p>
              <button
                type="button"
                className="btn"
                onClick={() => setFreshExtras((previous) => previous + 1)}
              >
                {commonText.t('tryAgain')}
              </button>
            </div>
          )}
          {tab === 'grammar' && extras && <GrammarTab key={extrasKey} extras={extras} />}
          {tab === 'homework' && extras && (
            <HomeworkTab
              tasks={extras.homework}
              storageKey={homeworkKey(docId, lesson.key)}
              language={extras.language}
            />
          )}
          {/* only for a lesson that is in the document, with Claude to write it */}
          {tab === 'homework' && ai && docWriter !== undefined && tagged && (
            <MakeHomework
              lesson={lesson}
              words={tagged.words}
              language={tagged.language}
              docId={docId}
              docWriter={docWriter}
              ai={ai}
            />
          )}
          {tab === 'book' && extrasState !== 'loading' && (
            <BookTab
              extras={extras}
              docId={docId}
              lessonKey={lesson.key}
              docWriter={docWriter}
              ai={ai}
            />
          )}
          {wantsExtras && extras && ai && (
            <p className="row-actions extras-refresh">
              <button
                type="button"
                className="btn ghost"
                onClick={() => setFreshExtras((previous) => previous + 1)}
              >
                {t('readAgain')}
              </button>
            </p>
          )}
          {tab === 'notes' && (
            <>
              <Notes storageKey={`notes:${docId}:${lesson.key}`} />
              <LessonDrawings docId={docId} date={lesson.date} />
            </>
          )}
          {tab === 'source' && <pre className="source">{lesson.body}</pre>}
        </div>
      </section>
    </>
  );
}
