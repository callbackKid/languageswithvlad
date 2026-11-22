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
  findCall,
  keyWordsFirst,
  languageOfLesson,
  type Lesson,
  openCallWindow,
  readAnalysis,
  usePreparedLesson,
} from '@/entities/lesson';
import { getProgress } from '@/entities/word';
import { type BoardServer } from '@/shared/api/boardSync';
import { lessonPath } from '@/shared/config/routes';
import { getSettings } from '@/shared/config/settings';
import { useTranslation } from '@/shared/i18n/core';
import { call } from '@/shared/i18n/messages/call';
import { game } from '@/shared/i18n/messages/game';
import { homework as homeworkText } from '@/shared/i18n/messages/homework';
import { makeExerciseText } from '@/shared/i18n/messages/makeExercise';
import { paper } from '@/shared/i18n/messages/paper';
import { talk } from '@/shared/i18n/messages/talk';
import { clockTime, dayKey } from '@/shared/lib/dates';
import { followLink, hrefFor } from '@/shared/lib/router';
import { load, loadChecked, remove, save } from '@/shared/lib/storage';
import { hash } from '@/shared/lib/util';
import CallCard from '@/shared/ui/CallCard';
import PageHead from '@/shared/ui/PageHead';
import Speak from '@/shared/ui/Speak';

import { homeworkLabel } from '../lib/makeHomework';
import { previousLesson, warmUpRound } from '../lib/warmUp';
import AddToDoc, { type DocTarget } from './AddToDoc';
import BookImport from './BookImport';
import Discuss from './Discuss';
import JitsiCall from './JitsiCall';
import LessonBoard from './LessonBoard';
import MakeExercise from './MakeExercise';
import QuizGame, {
  GAME_QUESTIONS,
  GAME_SECONDS,
  gameWords,
  readRecords,
  RecordsTable,
} from './QuizGame';
import WordQuiz from './WordQuiz';
import { KeyBadge } from './WordsTab';
import { WritingResult } from './WritingTask';
import ZoomCall from './ZoomCall';

const NAME_KEY = 'call:name';
// a name as Zoom shows it, and a meeting passcode (Zoom allows at most 10 characters; room to spare)
const MAX_NAME_LENGTH = 60;
const MAX_PASSCODE_LENGTH = 40;
const today = () => dayKey(new Date());
// the lesson's words an exercise practises at most; keep in step with MAX_EXERCISE_WORDS in api/analyze.ts
const MAX_EXERCISE_WORDS = 30;

// Today's date in UTC, the same for everyone wherever they are.
const utcDay = () => new Date().toISOString().slice(0, 10);

/** A video call on Jitsi inside the page, when the server is set up for it (JaaS): the teacher and
    the student join the same room for this document, a new one each day (in UTC, like the board). */
function JitsiCard({ appId, docId }: { appId: string; docId: string }) {
  const { t } = useTranslation(call);
  const [name, setName] = useState(() => load<string>(NAME_KEY) ?? getSettings().name);
  const [joined, setJoined] = useState(false);
  return (
    <CallCard id="jitsi" title={t('jitsiTitle')}>
      {joined ? (
        <JitsiCall
          appId={appId}
          room={`lesson-${hash(docId)}-${utcDay()}`}
          userName={name.trim()}
          onLeave={() => setJoined(false)}
        />
      ) : (
        <>
          <p className="hint">{t('jitsiExplain')}</p>
          <form
            className="call-join"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              save(NAME_KEY, name.trim());
              setJoined(true);
            }}
          >
            <label className="form-field">
              <span>{t('yourName')}</span>
              <input
                type="text"
                required
                maxLength={MAX_NAME_LENGTH}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="row-actions">
              <button type="submit" className="btn primary" disabled={!name.trim()}>
                {t('joinCall')}
              </button>
            </div>
          </form>
        </>
      )}
    </CallCard>
  );
}

// The call: Meet in a small window beside the app (it can't be embedded), Zoom inside the page.
function CallPanel({
  docText,
  zoomReady,
  hasJitsi,
}: {
  docText: string;
  zoomReady: boolean;
  // a Jitsi call is offered above: the document's link is then a second way, not a must
  hasJitsi: boolean;
}) {
  const { t } = useTranslation(call);
  const link = findCall(docText);
  const [blocked, setBlocked] = useState(false);
  const [name, setName] = useState(() => load<string>(NAME_KEY) ?? getSettings().name);
  const [passcode, setPasscode] = useState(link?.kind === 'zoom' ? link.passcode : '');
  const [joined, setJoined] = useState(false);

  if (!link) return hasJitsi ? null : <p className="empty">{t('noCall')}</p>;

  const newTab = (label: string) => (
    <a className="btn" href={link.url} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );

  if (link.kind === 'meet')
    return (
      <CallCard id="meet" title={t('meetTitle')}>
        <p className="hint">{t('meetExplain')}</p>
        <div className="row-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => setBlocked(!openCallWindow(link.url))}
          >
            {t('openMeet')}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setBlocked(!openCallWindow(link.url, 'half'))}
          >
            {t('sideBySide')}
          </button>
          {newTab(t('openInTab'))}
        </div>
        {blocked && (
          <div className="note warn" role="alert">
            <p>{t('popupBlocked')}</p>
          </div>
        )}
        <p className="legend">{t('pipTip')}</p>
      </CallCard>
    );

  // Zoom: inside the page when the server can sign, otherwise in Zoom itself
  const { meetingNumber } = link;
  if (!zoomReady || !meetingNumber)
    return (
      <CallCard id="zoom" title={t('zoomTitle')}>
        <p className="hint">{!meetingNumber ? t('zoomNoNumber') : t('zoomNotSetUp')}</p>
        <div className="row-actions">{newTab(t('openInZoom'))}</div>
      </CallCard>
    );
  return (
    <CallCard id="zoom" title={t('zoomTitle')}>
      {joined ? (
        <ZoomCall
          meetingNumber={meetingNumber}
          passcode={passcode}
          userName={name.trim()}
          onLeave={() => setJoined(false)}
        />
      ) : (
        <>
          <p className="hint">{t('zoomExplain')}</p>
          <form
            className="call-join"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              save(NAME_KEY, name.trim());
              setJoined(true);
            }}
          >
            <label className="form-field">
              <span>{t('yourName')}</span>
              <input
                type="text"
                required
                maxLength={MAX_NAME_LENGTH}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>{t('passcode')}</span>
              <input
                type="text"
                maxLength={MAX_PASSCODE_LENGTH}
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
              />
            </label>
            <div className="row-actions">
              <button type="submit" className="btn primary" disabled={!name.trim()}>
                {t('joinHere')}
              </button>
              {newTab(t('openInZoom'))}
            </div>
          </form>
        </>
      )}
    </CallCard>
  );
}

// Notes taken during the lesson, saved per day, with a button that adds them to the Google Doc.
function LessonNotes({ docId, target }: { docId: string; target: DocTarget }) {
  const { t } = useTranslation(call);
  const storageKey = `call-notes:${docId}:${today()}`;
  const [text, setText] = useState(() => load<string>(storageKey) ?? '');
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
          <button type="button" className="btn ghost" onClick={insertTime}>
            {t('insertTime')}
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={!text}
            onClick={() => {
              if (!window.confirm(t('clearConfirm'))) return;
              setText('');
              remove(storageKey);
            }}
          >
            {t('clearNotes')}
          </button>
        </>
      }
    >
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
  const [text, setText] = useState(() => load<string>(storageKey) ?? '');
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
              <span className="ru" lang="ru">
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
  const language = readAnalysis(lesson.hash)?.language ?? 'fr';
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
        <button type="button" className="btn primary" onClick={onStart}>
          {t('play')}
        </button>
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
        <button type="button" className="btn primary" disabled={preparing} onClick={onStart}>
          {preparing && lesson ? t('preparingWarmUp', { n: lesson.n }) : t('startWarmUp')}
        </button>
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
  return (
    <>
      <PageHead guide="call" title={t('title')}>
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
          {jitsiAppId && <JitsiCard appId={jitsiAppId} docId={docId} />}
          <CallPanel docText={docText} zoomReady={zoomReady} hasJitsi={!!jitsiAppId} />
          {!activity && (
            <WarmUpCard
              lesson={earlier}
              preparing={preparing}
              onStart={() => setActivity('warm-up')}
            />
          )}
          {!activity && newest && <GameCard docId={docId} onStart={() => setActivity('game')} />}
          {hasClaude && <MakeExerciseCard bank={bank} lesson={newest} />}
          <DiscussCard bank={bank} hasClaude={hasClaude} />
          <WrittenHomework lesson={earlier} docId={docId} />
          <LessonWords bank={bank} lesson={lessons[lessons.length - 1] ?? null} />
          {hasClaude && newest && (
            <BookCard docId={docId} lesson={newest} canWrite={!!target.docWriter} />
          )}
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
