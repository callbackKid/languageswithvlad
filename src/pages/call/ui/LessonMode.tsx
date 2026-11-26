import { type ReactNode, useEffect, useRef, useState } from 'react';

import {
  homeworkItems,
  normalizeWriting,
  readItem,
  type Writing,
  writingKey,
} from '@/entities/homework';
import {
  type Bank,
  keyWordsFirst,
  languageOfLesson,
  type Lesson,
  previousLesson,
  readLessonLanguage,
  usePreparedLesson,
  warmUpRound,
} from '@/entities/lesson';
import { getProgress } from '@/entities/word';
import { AddToDoc, type DocTarget } from '@/features/add-to-doc';
import { BookImport } from '@/features/import-book';
import { MakeExercise, makeExerciseText } from '@/features/make-exercise';
import { homeworkLabel } from '@/features/make-homework';
import { WordQuiz } from '@/features/quiz';
import { WritingResult } from '@/features/writing-task';
import { type BoardServer } from '@/shared/api';
import { getSettings, lessonPath, useTranslationLanguage } from '@/shared/config';
import { call, homework as homeworkText, paper, talk, useTranslation } from '@/shared/i18n';
import { clockTime, dayKey } from '@/shared/lib/dates';
import { followLink, hrefFor } from '@/shared/lib/router';
import { loadChecked, loadText, remove, save } from '@/shared/lib/storage';
import { useTabs } from '@/shared/lib/useTabs';
import { hash } from '@/shared/lib/util';
import CallCard from '@/shared/ui/CallCard';
import { Button } from '@/shared/ui/controls';
import InlineConfirm from '@/shared/ui/InlineConfirm';
import PageHead from '@/shared/ui/PageHead';
import Speak from '@/shared/ui/Speak';
import { Discuss } from '@/widgets/discussion';
import { KeyBadge } from '@/widgets/word-list';

import { game } from '../i18n/game';
import CallBar, { type JoinedCall } from './CallBar';
import JitsiCall from './JitsiCall';
import LessonBoard from './LessonBoard';
import QuizGame, {
  GAME_QUESTIONS,
  GAME_SECONDS,
  gameWords,
  readRecords,
  RecordsTable,
} from './QuizGame';
import ZoomCall from './ZoomCall';

const today = () => dayKey(new Date());
// the lesson's words an exercise practises at most; keep in step with MAX_EXERCISE_WORDS in api/analyze.ts
const MAX_EXERCISE_WORDS = 30;

// Today's date in UTC, the same for everyone wherever they are.
const utcDay = () => new Date().toISOString().slice(0, 10);

// Notes taken during the lesson, saved per day, with a button that adds them to the Google Doc.
function LessonNotes({ docId, target }: { docId: string; target: DocTarget }) {
  const { t } = useTranslation(call);
  const storageKey = `call-notes:${docId}:${today()}`;
  const [text, setText] = useState(() => loadText(storageKey) ?? '');
  // Clear was pressed: the question at the top of the card asks first
  const [isAskingToClear, setAskingToClear] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  const change = (value: string) => {
    setText(value);
    save(storageKey, value);
  };
  // "[18:05] " at the cursor, to mark when something came up
  const insertTime = () => {
    const stamp = `[${clockTime(new Date())}] `;
    const element = area.current;
    const start = element?.selectionStart ?? text.length;
    const end = element?.selectionEnd ?? text.length;
    const before = text.slice(0, start);
    const prefix = before && !before.endsWith('\n') ? '\n' : '';
    change(before + prefix + stamp + text.slice(end));
    requestAnimationFrame(() => {
      const position = start + prefix.length + stamp.length;
      element?.focus();
      element?.setSelectionRange(position, position);
    });
  };

  return (
    <CallCard
      id="notes"
      title={t('notesTitle')}
      className="call-notes"
      actions={
        <>
          <Button variant="ghost" onClick={insertTime}>
            {t('insertTime')}
          </Button>
          <Button
            variant="ghost"
            disabled={!text}
            aria-expanded={isAskingToClear}
            onClick={() => setAskingToClear(!isAskingToClear)}
          >
            {t('clearNotes')}
          </Button>
        </>
      }
    >
      {isAskingToClear && (
        <InlineConfirm
          question={t('clearConfirm')}
          yesLabel={t('clearNotes')}
          onYes={() => {
            setText('');
            remove(storageKey);
            setAskingToClear(false);
          }}
          onNo={() => setAskingToClear(false)}
        />
      )}
      <p className="hint">{t('notesHint')}</p>
      <textarea
        ref={area}
        className="notes"
        value={text}
        placeholder={t('notesPlaceholder')}
        aria-label={t('notesTitle')}
        onChange={(event) => change(event.target.value)}
      />
      {/* a new key per text: after "Added", editing the notes makes the button live again */}
      <AddToDoc key={hash(text)} target={target} lines={text.split('\n')} />
    </CallCard>
  );
}

/** The homework the teacher sets during the lesson, one task per line, saved on this device for
    the day. It goes into the document as a homework block ("Devoirs:" and a "- " line per task)
    under the lesson picked, the newest at first, so the student finds it on Home as a checklist. */
function HomeworkNotes({
  docId,
  target,
  lessons,
}: {
  docId: string;
  target: DocTarget;
  lessons: Lesson[];
}) {
  const { t } = useTranslation(call);
  const storageKey = `call-homework:${docId}:${today()}`;
  const [text, setText] = useState(() => loadText(storageKey) ?? '');
  const newest = lessons[lessons.length - 1] ?? null;
  const tasks = text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-•*]|\d{1,2}[.)])\s*/, '').trim())
    .filter(Boolean);
  const label = homeworkLabel(newest ? languageOfLesson(newest) : 'fr');
  const change = (value: string) => {
    setText(value);
    save(storageKey, value);
  };
  return (
    <CallCard id="homework" title={t('homeworkTitle')} className="call-homework">
      <p className="hint">{t('homeworkHint')}</p>
      <textarea
        className="notes"
        value={text}
        placeholder={t('homeworkPlaceholder')}
        aria-label={t('homeworkTitle')}
        onChange={(event) => change(event.target.value)}
      />
      {/* a new key when the tasks change or a newer lesson arrives: the button and the picker start over */}
      <AddToDoc
        key={hash(text) + (newest?.key ?? '')}
        target={target}
        lines={tasks.length ? [`${label}:`, ...tasks.map((task) => `- ${task}`)] : []}
        lessons={lessons}
        defaultLesson={newest?.key}
      />
    </CallCard>
  );
}

// The words of the newest lesson, to glance at and say aloud during the call.
function LessonWords({ bank, lesson }: { bank: Bank; lesson: Lesson | null }) {
  const { t } = useTranslation(call);
  const translationOf = useTranslationLanguage();
  // the key words (★) first
  const words = keyWordsFirst(
    lesson ? bank.words.filter((word) => word.lesson === lesson.key) : []
  );
  return (
    <CallCard
      id="words"
      title={t('wordsTitle')}
      actions={
        <>
          {lesson && (
            <a
              className="open-link"
              href={hrefFor(lessonPath(lesson.key))}
              onClick={(event) => followLink(event, lessonPath(lesson.key))}
            >
              {t('openLesson')} →
            </a>
          )}
        </>
      }
    >
      {words.length ? (
        <ul className="call-words">
          {words.map((word) => (
            <li key={word.fr}>
              <span className="fr" lang={word.language ?? 'fr'}>
                {word.fr}
                {word.key && (
                  <>
                    {' '}
                    <KeyBadge />
                  </>
                )}
              </span>
              <span className="ru" data-no-word-actions lang={translationOf(word.language)}>
                {word.ru}
              </span>
              <Speak text={word.fr} language={word.language ?? 'fr'} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">{t('noWords')}</p>
      )}
    </CallCard>
  );
}

/** The student's answers to the previous lesson's written tasks, as Claude corrected them, for
    the teacher to go over on the shared screen. Kept on the student's device, so shown there. */
function WrittenHomework({ lesson, docId }: { lesson: Lesson | null; docId: string }) {
  const { t } = useTranslation(homeworkText);
  if (!lesson) return null;
  const language = readLessonLanguage(lesson.hash) ?? 'fr';
  const written = homeworkItems(lesson.body)
    .map(readItem)
    .filter((item) => item.kind === 'writing')
    .map((item) => loadChecked(writingKey(docId, lesson.key, item.text), normalizeWriting))
    .filter((writing): writing is Writing => !!writing?.text.trim());
  if (!written.length) return null;
  return (
    <CallCard id="written" title={t('writtenTitle')} className="written-homework">
      <p className="hint">{t('writtenHint', { n: lesson.n })}</p>
      {written.map((writing) => (
        <details key={writing.task}>
          <summary>
            <span lang={language}>{writing.task}</span>
            <span className="count">
              {writing.check
                ? t('mistakesTitle', { count: writing.check.mistakes.length })
                : t('notChecked')}
            </span>
          </summary>
          {writing.check ? (
            <WritingResult check={writing.check} language={language} />
          ) : (
            <p className="writing-corrected" lang={language}>
              {writing.text}
            </p>
          )}
        </details>
      ))}
    </CallCard>
  );
}

/** Where the warm-up or the game opens: above the call, scrolled into view, since the button
    that opened it may be further down. */
function ActivityPlace({ children }: { children: ReactNode }) {
  const place = useRef<HTMLElement>(null);
  useEffect(() => {
    place.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  return (
    <section ref={place} className="warm-up">
      {children}
    </section>
  );
}

// The exercise maker, on the newest lesson's words (key words first) and any grammar point.
function MakeExerciseCard({ bank, lesson }: { bank: Bank; lesson: Lesson | null }) {
  const { t } = useTranslation(makeExerciseText);
  const words = keyWordsFirst(lesson ? bank.words.filter((word) => word.lesson === lesson.key) : [])
    .map((word) => word.fr)
    .slice(0, MAX_EXERCISE_WORDS);
  return (
    <CallCard id="exercise" title={t('title')} className="exercise-card">
      <MakeExercise
        language={lesson ? languageOfLesson(lesson) : (getSettings().studying[0] ?? 'fr')}
        words={words}
        lessonNumber={lesson?.n ?? null}
      />
    </CallCard>
  );
}

// A discussion question for the lesson, made here as on its own page.
// Pages of the student's book, from photos or a PDF, written under the newest lesson.
function BookCard({
  docId,
  lesson,
  canWrite,
}: {
  docId: string;
  lesson: Lesson;
  canWrite: boolean;
}) {
  const { t } = useTranslation(paper);
  const callText = useTranslation(call);
  return (
    <CallCard id="book" title={t('importBook')}>
      <p className="hint">
        {callText.t('bookUnder', { lesson: lesson.title ?? `${lesson.word} ${lesson.n}` })}
      </p>
      <BookImport docId={docId} lessonKey={lesson.key} docWriter={canWrite} embedded />
    </CallCard>
  );
}

function DiscussCard({ bank, hasClaude }: { bank: Bank; hasClaude: boolean }) {
  const { t } = useTranslation(talk);
  return (
    <CallCard id="discuss" title={t('discussTitle')} className="discuss-card">
      <Discuss bank={bank} hasClaude={hasClaude} embedded />
    </CallCard>
  );
}

// The quiz game offered during the lesson, with the records so far.
function GameCard({ docId, onStart }: { docId: string; onStart: () => void }) {
  const { t } = useTranslation(game);
  return (
    <CallCard id="game" title={t('title')}>
      <p className="hint">{t('hint', { count: GAME_QUESTIONS, seconds: GAME_SECONDS })}</p>
      <RecordsTable records={readRecords(docId)} />
      <div className="row-actions">
        <Button variant="primary" onClick={onStart}>
          {t('play')}
        </Button>
      </div>
    </CallCard>
  );
}

// The warm-up offered at the start of the lesson.
function WarmUpCard({
  lesson,
  preparing,
  onStart,
}: {
  lesson: Lesson | null;
  preparing: boolean;
  onStart: () => void;
}) {
  const { t, locale } = useTranslation(call);
  const date = (value: Date) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(value);
  return (
    <CallCard id="warm-up" title={t('warmUpTitle')}>
      <p className="hint">
        {lesson
          ? t('warmUpHint', { n: lesson.n, date: date(lesson.date) })
          : t('warmUpHintNoLesson')}
      </p>
      <div className="row-actions">
        <Button variant="primary" disabled={preparing} onClick={onStart}>
          {preparing && lesson ? t('preparingWarmUp', { n: lesson.n }) : t('startWarmUp')}
        </Button>
      </div>
    </CallCard>
  );
}

/** The warm-up round: the previous lesson's words and the student's mistakes since, ending with
    the list of what didn't stick, for the teacher to see on the shared screen. */
function WarmUp({
  bank,
  lesson,
  onClose,
}: {
  bank: Bank;
  lesson: Lesson | null;
  onClose: () => void;
}) {
  const { t } = useTranslation(call);
  return (
    <ActivityPlace>
      <WordQuiz
        title={lesson ? t('warmUpRound', { n: lesson.n }) : t('warmUpTitle')}
        make={() => warmUpRound(bank, lesson, getProgress())}
        onClose={onClose}
        closeLabel={t('backToLesson')}
        empty={t('warmUpEmpty')}
        review={{ title: t('missedTitle'), none: t('allStuck') }}
      />
    </ActivityPlace>
  );
}

// Lesson mode: the call, the warm-up and the game, the teacher's notes and the lesson's words on one screen.
// The two tabs under the call: the lesson's own cards, and the warm-up, the game and Discuss.
const CALL_TABS = ['lesson', 'activities'] as const;
type CallTab = (typeof CALL_TABS)[number];
// the tab last chosen, kept on this device
const TAB_KEY = 'call:tab';
const readCallTab = (): CallTab => CALL_TABS.find((tab) => tab === loadText(TAB_KEY)) ?? 'lesson';

export default function LessonMode({
  docText,
  docId,
  bank,
  lessons,
  target,
  zoomReady,
  jitsiAppId,
  boardServer,
  hasClaude,
}: {
  docText: string;
  docId: string;
  bank: Bank;
  lessons: Lesson[];
  target: DocTarget;
  zoomReady: boolean;
  // the JaaS AppID when video calls on Jitsi run inside the app
  jitsiAppId: string | null;
  boardServer: BoardServer | null;
  hasClaude: boolean;
}) {
  const { t } = useTranslation(call);
  // the warm-up or the game, shown above the call
  const [activity, setActivity] = useState<'warm-up' | 'game' | null>(null);
  const earlier = previousLesson(lessons);
  const preparing = usePreparedLesson(earlier, bank, hasClaude);
  const newest = lessons[lessons.length - 1] ?? null;
  const [tab, setTab] = useState<CallTab>(readCallTab);
  const { tabListProps, tabProps, panelProps } = useTabs(tab);
  // the call running in the page (Jitsi or Zoom); its video sits above the tabs, so a tab never closes it
  const [joined, setJoined] = useState<JoinedCall | null>(null);
  function chooseTab(chosen: CallTab) {
    setTab(chosen);
    save(TAB_KEY, chosen);
  }
  return (
    <>
      <PageHead
        guide="call"
        title={t('title')}
        aside={
          <CallBar
            docText={docText}
            zoomReady={zoomReady}
            hasJitsi={!!jitsiAppId}
            joined={joined}
            onJoin={setJoined}
            onLeave={() => setJoined(null)}
          />
        }
      >
        {t('intro')}
      </PageHead>
      {/* above the call rather than instead of it: closing a Zoom call's panel would end the call */}
      {activity === 'warm-up' && (
        <WarmUp bank={bank} lesson={earlier} onClose={() => setActivity(null)} />
      )}
      {activity === 'game' && newest && (
        <ActivityPlace>
          <QuizGame
            words={gameWords(lessons, bank, hasClaude)}
            pool={bank.words}
            lessonNumber={newest.n}
            lessonKey={newest.key}
            docId={docId}
            onClose={() => setActivity(null)}
          />
        </ActivityPlace>
      )}
      <div className="lesson-mode">
        <div className="lesson-mode-side">
          {joined?.kind === 'jitsi' && jitsiAppId && (
            <CallCard id="jitsi" title={t('jitsiTitle')}>
              <JitsiCall
                appId={jitsiAppId}
                room={`lesson-${hash(docId)}-${utcDay()}`}
                userName={joined.name}
                onLeave={() => setJoined(null)}
              />
            </CallCard>
          )}
          {joined?.kind === 'zoom' && (
            <CallCard id="zoom" title={t('zoomTitle')}>
              <ZoomCall
                meetingNumber={joined.meetingNumber}
                passcode={joined.passcode}
                userName={joined.name}
                onLeave={() => setJoined(null)}
              />
            </CallCard>
          )}
          {/* under the call, so switching never closes it; both tabs stay on the page, hidden in
              turn, so an exercise or a discussion question in progress isn't lost */}
          <div className="tabs call-tabs" {...tabListProps} aria-label={t('callTabs')}>
            {CALL_TABS.map((id) => (
              <Button
                variant="unstyled"
                key={id}
                className="tab"
                {...tabProps(id)}
                onClick={() => chooseTab(id)}
              >
                {id === 'lesson' ? t('lessonTab') : t('activitiesTab')}
              </Button>
            ))}
          </div>
          <div className="call-tab-panel" {...panelProps('lesson')}>
            {hasClaude && <MakeExerciseCard bank={bank} lesson={newest} />}
            <WrittenHomework lesson={earlier} docId={docId} />
            <LessonWords bank={bank} lesson={newest} />
            {hasClaude && newest && (
              <BookCard docId={docId} lesson={newest} canWrite={!!target.docWriter} />
            )}
          </div>
          <div className="call-tab-panel" {...panelProps('activities')}>
            {!activity && (
              <WarmUpCard
                lesson={earlier}
                preparing={preparing}
                onStart={() => setActivity('warm-up')}
              />
            )}
            {!activity && newest && <GameCard docId={docId} onStart={() => setActivity('game')} />}
            <DiscussCard bank={bank} hasClaude={hasClaude} />
          </div>
        </div>
        <LessonNotes docId={docId} target={target} />
      </div>
      {/* the room is the same for the teacher and the student on this document today; the day is
          counted in UTC, so people in different time zones still meet on one board. This device
          keeps its copy under its own day, like the notes, so the lesson page finds it. */}
      <LessonBoard
        storageKey={`board:${docId}:${today()}`}
        room={`board:${hash(docId)}:${utcDay()}`}
        server={boardServer}
      />
      <HomeworkNotes docId={docId} target={target} lessons={lessons} />
    </>
  );
}
