import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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
import { VerbsTab } from '@/features/conjugate-verb';
import { MakeHomework } from '@/features/make-homework';
import { api, ApiError } from '@/shared/api';
import {
  isVerbLanguage,
  LESSON_TABS,
  type LessonTab,
  useSettings,
  useTeacher,
} from '@/shared/config';
import {
  common,
  getUiLanguage,
  paper,
  translator,
  type UiLanguage,
  useTranslation,
} from '@/shared/i18n';
import { requestOnce } from '@/shared/lib/once';
import { loadChecked, save } from '@/shared/lib/storage';
import { useTabs } from '@/shared/lib/useTabs';
import { shownTopic } from '@/shared/lib/util';
import { Button } from '@/shared/ui/controls';
import HelpLink from '@/shared/ui/HelpLink';
import WaitingFact from '@/shared/ui/WaitingFact';

import { homeworkTasks } from '../model/homeworkTasks';
import { phoneticsKey, readPhonetics } from '../model/phonetics';
import LessonDrawings from './LessonDrawings';
import { BookTab, GrammarTab, HomeworkTab } from './LessonExtrasTabs';
import Notes from './Notes';
import PhoneticsTab from './PhoneticsTab';

type Tab = LessonTab;
const EXTRA_TABS: Tab[] = ['grammar', 'homework', 'book'];

// What LessonView hands the word list it shows in its Words tab.
export interface LessonWordsProps {
  analysis: Analysis;
  hasClaude: boolean;
  lessonKey: string;
  onRefresh?: () => void;
}

// One lesson's page: its heading and its tabs (Words, Verbs, Grammar, Homework, Book exercises, My notes, Original).
export default function LessonView({
  lesson,
  docId,
  hasClaude,
  docWriter,
  onAnalysis,
  isNewest = false,
  renderWords,
}: {
  lesson: Lesson;
  docId: string;
  hasClaude: boolean;
  /** whether the server can write to this document (to add exercises from the book); left out
      for a lesson that isn't in the document */
  docWriter?: boolean;
  onAnalysis?: (
    lesson: Pick<Lesson, 'key' | 'hash'>,
    analysis: Analysis,
    translateTo: UiLanguage
  ) => void;
  // the newest lesson in the document, whose homework Home shows with an exercise per task
  isNewest?: boolean;
  /** the Words tab's list, given by the page: it is another widget (word-list), and one widget
      can't import another */
  renderWords: (props: LessonWordsProps) => ReactNode;
}) {
  const { t, locale, language: uiLanguage } = useTranslation(paper);
  const commonText = useTranslation(common);
  const { hiddenTabs, translateTo } = useSettings();
  const shownTabs = LESSON_TABS.filter((id) => !hiddenTabs.includes(id));
  const [chosenTab, setTab] = useState<Tab>('words');
  // a tab hidden in Settings gives way to the first one shown
  const tab = shownTabs.includes(chosenTab) ? chosenTab : (shownTabs[0] ?? 'words');
  const { tabListProps, tabProps, panelProps } = useTabs(tab);
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

  // Analyses are cached by the lesson text's hash and the translation language: editing a lesson
  // or choosing another translation language prepares it again.
  useEffect(() => {
    let alive = true;
    const cached = fresh ? null : readAnalysis(lesson.hash, translateTo);
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
        if (alive || !readAnalysis(lesson.hash, translateTo))
          save(analysisKey(lesson.hash, translateTo), prepared);
        if (alive) {
          onAnalysis?.({ key: lesson.key, hash: lesson.hash }, prepared, translateTo);
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
  }, [
    lesson.hash,
    lesson.key,
    lesson.body,
    headingLanguage,
    hasClaude,
    fresh,
    onAnalysis,
    translateTo,
  ]);

  // The grammar, homework and book exercises: read once, the first time one of their tabs is
  // opened, and kept for this lesson text and interface language.
  const extrasKey = `extras:${lesson.hash}:${uiLanguage}`;
  const [extras, setExtras] = useState<LessonExtras | null>(() =>
    loadChecked(extrasKey, normalizeExtras)
  );
  const [extrasState, setExtrasState] = useState<'idle' | 'loading' | 'error'>('idle');
  // why the reading failed, in the interface language (a lesson too long, no access…)
  const [extrasError, setExtrasError] = useState('');
  const [freshExtras, setFreshExtras] = useState(0);
  const wantsExtras = EXTRA_TABS.includes(tab);
  // the teacher's tasks when the text has a homework block, with what Claude says each asks
  const homework = homeworkTasks(lesson.body, extras?.homework ?? null);
  const hasTeacherHomework = homeworkItems(lesson.body).length > 0;
  useEffect(() => {
    const cached = freshExtras ? null : loadChecked(extrasKey, normalizeExtras);
    setExtras(cached);
    setExtrasState('idle');
    if (cached || !wantsExtras || !hasClaude) return;
    let alive = true;
    setExtrasState('loading');
    // a reading already on its way (the tab left and opened again) is waited for, not paid twice
    requestOnce(extrasKey, () => api.lessonExtras(lesson.body, getUiLanguage(), freshExtras > 0))
      .then((raw) => {
        const read = normalizeExtras(raw);
        save(extrasKey, read);
        if (alive) {
          setExtras(read);
          setExtrasState('idle');
        }
      })
      .catch((failure: unknown) => {
        if (!alive) return;
        setExtrasState('error');
        setExtrasError(
          failure instanceof ApiError ? failure.message : translator(common).t('unreadable')
        );
      });
    return () => {
      alive = false;
    };
  }, [extrasKey, lesson.body, wantsExtras, hasClaude, freshExtras]);

  // the Phonetics tab's count: from the reading kept on the device, or from the tab once it reads
  const phoneticsStorageKey = phoneticsKey(lesson.hash, uiLanguage);
  const [phoneticsFound, setPhoneticsFound] = useState<{ key: string; count: number } | null>(null);
  const phoneticsCount =
    phoneticsFound?.key === phoneticsStorageKey
      ? phoneticsFound.count
      : readPhonetics(phoneticsStorageKey)?.topics.length;

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
      <Button variant="unstyled" className="tab" {...tabProps(id)} onClick={() => setTab(id)}>
        {label}
        {count !== undefined && <span className="count">{count}</span>}
      </Button>
    );

  let note = null;
  if (state === 'loading')
    note = <WaitingFact language={analysis?.language}>{t('preparing')}</WaitingFact>;
  else if (state === 'error')
    note = (
      <div className="note err">
        <p>{error}</p>
        <Button onClick={() => setFresh((previous) => previous + 1)}>
          {commonText.t('tryAgain')}
        </Button>
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
        <div
          className="tabs"
          {...tabListProps}
          aria-label={lesson.title || `${lesson.word} ${lesson.n}`}
          ref={tabList}
        >
          {tabButton('words', t('words'), tagged?.words.length ?? 0)}
          {tabButton('verbs', t('verbs'), tagged?.verbs.length ?? 0)}
          {tabButton('grammar', t('grammar'), extras?.grammar.length)}
          {tabButton('phonetics', t('phonetics'), phoneticsCount)}
          {tabButton('homework', t('homework'), homework?.length)}
          {tabButton('book', t('book'), extras?.book.length)}
          {tabButton('notes', t('myNotes'))}
          {tabButton('source', t('original'))}
        </div>
        {shownTabs.map((id) => id !== tab && <div key={id} {...panelProps(id)} />)}
        <div key={tab} className="body" {...panelProps(tab)}>
          {(tab === 'words' || tab === 'verbs') && note}
          {tab === 'words' && tagged && (
            <Fragment key={lesson.hash + (tagged.local ? 'l' : 'c')}>
              {renderWords({
                analysis: tagged,
                hasClaude: hasClaude && !tagged.local,
                lessonKey: lesson.key,
                onRefresh:
                  hasClaude && state === 'ready' && !tagged.local
                    ? () => setFresh((previous) => previous + 1)
                    : undefined,
              })}
            </Fragment>
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
          {/* the teacher's homework tasks show without Claude, only their explanations need it */}
          {wantsExtras && !hasClaude && !extras && !(tab === 'homework' && hasTeacherHomework) && (
            <p className="empty">{commonText.t('needsClaude')}</p>
          )}
          {wantsExtras && extrasState === 'loading' && (
            <WaitingFact language={analysis?.language}>{t('readingExtras')}</WaitingFact>
          )}
          {wantsExtras && extrasState === 'error' && (
            <div className="note err" role="alert">
              <p>{extrasError}</p>
              <Button onClick={() => setFreshExtras((previous) => previous + 1)}>
                {commonText.t('tryAgain')}
              </Button>
            </div>
          )}
          {tab === 'grammar' && extras && <GrammarTab key={extrasKey} extras={extras} />}
          {tab === 'phonetics' && (
            <PhoneticsTab
              key={lesson.hash}
              body={lesson.body}
              hash={lesson.hash}
              language={analysis?.language ?? headingLanguage}
              hasClaude={hasClaude}
              onRead={(count) => setPhoneticsFound({ key: phoneticsStorageKey, count })}
            />
          )}
          {tab === 'homework' && homework && (
            <HomeworkTab
              tasks={homework}
              storageKey={homeworkKey(docId, lesson.key)}
              language={extras?.language ?? analysis?.language ?? headingLanguage}
              onHome={isNewest && hasTeacherHomework}
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
              <Button variant="ghost" onClick={() => setFreshExtras((previous) => previous + 1)}>
                {t('readAgain')}
              </Button>
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
