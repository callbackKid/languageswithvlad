import { useEffect, useMemo, useRef, useState } from 'react';

import { homeworkItems, homeworkKey } from '@/entities/homework';
import {
  type Analysis,
  analysisKey,
  languageOfLesson,
  type Lesson,
  type LessonExtras,
  localParse,
  markKeyWords,
  normalizeAnalysis,
  normalizeExtras,
  readAnalysis,
  useRemoved,
  withoutRemoved,
} from '@/entities/lesson';
import { MakeHomework } from '@/features/make-homework';
import { api, ApiError } from '@/shared/api';
import { isVerbLanguage } from '@/shared/config/languages';
import { LESSON_TABS, type LessonTab, useSettings } from '@/shared/config/settings';
import { useTeacher } from '@/shared/config/teacher';
import { getUiLanguage, translator, useTranslation } from '@/shared/i18n/core';
import { common } from '@/shared/i18n/messages/common';
import { paper } from '@/shared/i18n/messages/paper';
import { loadChecked, save } from '@/shared/lib/storage';
import { shownTopic } from '@/shared/lib/util';
import HelpLink from '@/shared/ui/HelpLink';
import WaitingFact from '@/shared/ui/WaitingFact';

import LessonDrawings from './LessonDrawings';
import { BookTab, GrammarTab, HomeworkTab } from './LessonExtrasTabs';
import Notes from './Notes';
import VerbsTab from './VerbsTab';
import WordsTab from './WordsTab';

type Tab = LessonTab;
const EXTRA_TABS: Tab[] = ['grammar', 'homework', 'book'];

// One lesson's page: its heading and its tabs (Words, Verbs, Grammar, Homework, Book exercises, My notes, Original).
export default function LessonView({
  lesson,
  docId,
  hasClaude,
  docWriter,
  onAnalysis,
  isNewest = false,
}: {
  lesson: Lesson;
  docId: string;
  hasClaude: boolean;
  /** whether the server can write to this document (to add exercises from the book); left out
      for a lesson that isn't in the document */
  docWriter?: boolean;
  onAnalysis?: (lessonKey: string, analysis: Analysis) => void;
  // the newest lesson in the document, whose homework Home shows with an exercise per task
  isNewest?: boolean;
}) {
  const { t, locale, language: uiLanguage } = useTranslation(paper);
  const commonText = useTranslation(common);
  const { hiddenTabs } = useSettings();
  const shownTabs = LESSON_TABS.filter((id) => !hiddenTabs.includes(id));
  const [chosenTab, setTab] = useState<Tab>('words');
  // a tab hidden in Settings gives way to the first one shown
  const tab = shownTabs.includes(chosenTab) ? chosenTab : (shownTabs[0] ?? 'words');
  const { isTeacher } = useTeacher();
  // on a phone the tabs scroll sideways: the open one is kept in view
  const tabList = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = tabList.current;
    const open = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !open) return;
    const box = list.getBoundingClientRect();
    const own = open.getBoundingClientRect();
    if (own.left < box.left || own.right > box.right)
      list.scrollLeft += own.left - box.left - (box.width - own.width) / 2;
  }, [tab]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [fresh, setFresh] = useState(0);
  // without Claude, the heading word ("Lektion") tells the lesson's language
  const headingLanguage = languageOfLesson(lesson);

  // Analyses are cached by the lesson text's hash: editing a lesson re-prepares it.
  useEffect(() => {
    let alive = true;
    const cached = fresh ? null : readAnalysis(lesson.hash);
    if (cached) {
      setAnalysis(cached);
      setState('ready');
      return;
    }
    if (!hasClaude) {
      setAnalysis(localParse(lesson.body, headingLanguage));
      setState('ready');
      return;
    }
    setAnalysis((previous) =>
      previous && !previous.local ? previous : localParse(lesson.body, headingLanguage)
    );
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
  }, [lesson.hash, lesson.key, lesson.body, headingLanguage, hasClaude, fresh, onAnalysis]);

  // The grammar, homework and book exercises: read once, the first time one of their tabs is
  // opened, and kept for this lesson text and interface language.
  const extrasKey = `extras:${lesson.hash}:${uiLanguage}`;
  const [extras, setExtras] = useState<LessonExtras | null>(() =>
    loadChecked(extrasKey, normalizeExtras)
  );
  const [extrasState, setExtrasState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [freshExtras, setFreshExtras] = useState(0);
  const wantsExtras = EXTRA_TABS.includes(tab);
  useEffect(() => {
    const cached = freshExtras ? null : loadChecked(extrasKey, normalizeExtras);
    setExtras(cached);
    setExtrasState('idle');
    if (cached || !wantsExtras || !hasClaude) return;
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
  }, [extrasKey, lesson.body, wantsExtras, hasClaude, freshExtras]);

  const removed = useRemoved();
  // Words and verbs carry their lesson (progress and stats group by it, ✕ takes them out of it);
  // the ones the student took out of the lesson are left out.
  const tagged = useMemo(() => {
    if (!analysis) return null;
    const kept = withoutRemoved(analysis, lesson.key, removed);
    return {
      ...kept,
      words: markKeyWords(kept.words, lesson.body).map((word) => ({
        ...word,
        lesson: lesson.key,
        language: analysis.language,
      })),
      verbs: kept.verbs.map((verb) => ({
        ...verb,
        lesson: lesson.key,
        language: analysis.language,
      })),
    };
  }, [analysis, lesson.key, lesson.body, removed]);

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
        {analysis && shownTopic(analysis.topic, uiLanguage) && (
          <p className="topic">{analysis.topic}</p>
        )}
      </section>
      <section className="panel">
        <div className="tabs" role="tablist" ref={tabList}>
          {tabButton('words', t('words'), tagged?.words.length ?? 0)}
          {tabButton('verbs', t('verbs'), tagged?.verbs.length ?? 0)}
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
              hasClaude={hasClaude && !tagged.local}
              grouped
              lessonKey={lesson.key}
              onRefresh={
                hasClaude && state === 'ready' && !tagged.local
                  ? () => setFresh((previous) => previous + 1)
                  : undefined
              }
            />
          )}
          {tab === 'verbs' && analysis && !isVerbLanguage(analysis.language) && (
            <p className="empty">{t('noEnglishVerbTables')}</p>
          )}
          {tab === 'verbs' && tagged && isVerbLanguage(tagged.language) && (
            <VerbsTab
              key={lesson.hash}
              verbs={tagged.verbs}
              lessonKey={lesson.key}
              hasClaude={hasClaude && !tagged.local}
              waiting={state === 'loading'}
            />
          )}
          {wantsExtras && !hasClaude && !extras && (
            <p className="empty">{commonText.t('needsClaude')}</p>
          )}
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
              onHome={isNewest && homeworkItems(lesson.body).length > 0}
            />
          )}
          {/* the teacher's tool, for a lesson that is in the document, with Claude to write it */}
          {tab === 'homework' && isTeacher && hasClaude && docWriter !== undefined && tagged && (
            <MakeHomework
              lesson={lesson}
              words={tagged.words}
              language={tagged.language}
              docId={docId}
              docWriter={docWriter}
              hasClaude={hasClaude}
            />
          )}
          {tab === 'book' && extrasState !== 'loading' && (
            <BookTab
              extras={extras}
              docId={docId}
              lessonKey={lesson.key}
              docWriter={docWriter}
              hasClaude={hasClaude}
            />
          )}
          {wantsExtras && extras && hasClaude && (
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
