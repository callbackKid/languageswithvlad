import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { call } from '../i18n/messages/call';
import { api } from '../lib/api';
import { analysisKey, type Bank, readAnalysis } from '../lib/bank';
import type { BoardServer } from '../lib/boardSync';
import { findCall, openCallWindow } from '../lib/call';
import { normalizeAnalysis } from '../lib/parse';
import { getProgress } from '../lib/progress';
import { followLink, hrefFor } from '../lib/router';
import { lessonPath } from '../lib/sections';
import { getSettings } from '../lib/settings';
import { load, remove, save } from '../lib/storage';
import type { Lesson } from '../lib/types';
import { hash } from '../lib/util';
import { previousLesson, warmUpRound } from '../lib/warmUp';
import AddToDoc, { type DocTarget } from './AddToDoc';
import LessonBoard from './LessonBoard';
import PageHead from './PageHead';
import Speak from './Speak';
import WordQuiz from './WordQuiz';
import ZoomCall from './ZoomCall';

const NAME_KEY = 'call:name';
const pad = (value: number) => String(value).padStart(2, '0');
const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Today's date in UTC, the same for everyone wherever they are. */
const utcDay = () => new Date().toISOString().slice(0, 10);

/** The call: Meet in a small window beside the app (it can't be embedded), Zoom inside the page. */
function CallPanel({ docText, zoomReady }: { docText: string; zoomReady: boolean }) {
  const { t } = useTranslation(call);
  const link = findCall(docText);
  const [blocked, setBlocked] = useState(false);
  const [name, setName] = useState(() => load<string>(NAME_KEY) ?? getSettings().name);
  const [passcode, setPasscode] = useState(link?.kind === 'zoom' ? link.passcode : '');
  const [joined, setJoined] = useState(false);

  if (!link) return <p className="empty">{t('noCall')}</p>;

  const newTab = (label: string) => (
    <a className="btn" href={link.url} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );

  if (link.kind === 'meet')
    return (
      <section className="call-card">
        <h2>{t('meetTitle')}</h2>
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
      </section>
    );

  // Zoom: inside the page when the server can sign, otherwise in Zoom itself
  const { meetingNumber } = link;
  if (!zoomReady || !meetingNumber)
    return (
      <section className="call-card">
        <h2>{t('zoomTitle')}</h2>
        <p className="hint">{!meetingNumber ? t('zoomNoNumber') : t('zoomNotSetUp')}</p>
        <div className="row-actions">{newTab(t('openInZoom'))}</div>
      </section>
    );
  return (
    <section className="call-card">
      <h2>{t('zoomTitle')}</h2>
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
                maxLength={60}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>{t('passcode')}</span>
              <input
                type="text"
                maxLength={40}
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
    </section>
  );
}

/** Notes taken during the lesson, saved per day, with a button that adds them to the Google Doc. */
function LessonNotes({ docId, target }: { docId: string; target: DocTarget }) {
  const { t } = useTranslation(call);
  const storageKey = `call-notes:${docId}:${today()}`;
  const [text, setText] = useState(() => load<string>(storageKey) ?? '');
  const area = useRef<HTMLTextAreaElement>(null);

  const change = (value: string) => {
    setText(value);
    save(storageKey, value);
  };
  /** "[18:05] " at the cursor, to mark when something came up */
  const insertTime = () => {
    const now = new Date();
    const stamp = `[${pad(now.getHours())}:${pad(now.getMinutes())}] `;
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
    <section className="call-card call-notes">
      <div className="call-card-head">
        <h2>{t('notesTitle')}</h2>
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
      </div>
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
    </section>
  );
}

/** The words of the newest lesson, to glance at and say aloud during the call. */
function LessonWords({ bank, lesson }: { bank: Bank; lesson: Lesson | null }) {
  const { t } = useTranslation(call);
  const words = lesson ? bank.words.filter((word) => word.lesson === lesson.key) : [];
  return (
    <section className="call-card">
      <div className="call-card-head">
        <h2>{t('wordsTitle')}</h2>
        {lesson && (
          <a
            className="open-link"
            href={hrefFor(lessonPath(lesson.key))}
            onClick={(event) => followLink(event, lessonPath(lesson.key))}
          >
            {t('openLesson')} →
          </a>
        )}
      </div>
      {words.length ? (
        <ul className="call-words">
          {words.map((word) => (
            <li key={word.fr}>
              <span className="fr" lang={word.language ?? 'fr'}>
                {word.fr}
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
    </section>
  );
}

/** The warm-up offered at the start of the lesson. */
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
    <section className="call-card">
      <h2>{t('warmUpTitle')}</h2>
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
    </section>
  );
}

/** Only the newest lesson is prepared by itself (AUTO_PREPARE). Once today's lesson is in the
    document, the one before it may not be on this device yet, so lesson mode prepares it for
    the warm-up. True while Claude is reading it. */
function usePrepared(lesson: Lesson | null, bank: Bank, ai: boolean): boolean {
  const ready =
    !lesson ||
    bank.lessons.some((info) => info.key === lesson.key && info.ready) ||
    !!readAnalysis(lesson.hash);
  const [preparing, setPreparing] = useState(false);
  const { put } = bank;
  useEffect(() => {
    if (!lesson || ready || !ai) return;
    let alive = true;
    setPreparing(true);
    api
      .analyze(lesson.body)
      .then((raw) => {
        const analysis = normalizeAnalysis(raw);
        save(analysisKey(lesson.hash), analysis);
        put(lesson.key, analysis);
      })
      // the warm-up then asks about the mistakes alone
      .catch(() => {})
      .finally(() => {
        if (alive) setPreparing(false);
      });
    return () => {
      alive = false;
    };
  }, [lesson, ready, ai, put]);
  return preparing;
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
  const place = useRef<HTMLElement>(null);
  // it opens above the call, out of view when the button was further down
  useEffect(() => {
    place.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  return (
    <section ref={place} className="warm-up">
      <WordQuiz
        title={lesson ? t('warmUpRound', { n: lesson.n }) : t('warmUpTitle')}
        make={() => warmUpRound(bank, lesson, getProgress())}
        onClose={onClose}
        closeLabel={t('backToLesson')}
        empty={t('warmUpEmpty')}
        review={{ title: t('missedTitle'), none: t('allStuck') }}
      />
    </section>
  );
}

/** Lesson mode: the call, the warm-up, the teacher's notes and the lesson's words on one screen. */
export default function LessonMode({
  docText,
  docId,
  bank,
  lessons,
  target,
  zoomReady,
  boardServer,
  ai,
}: {
  docText: string;
  docId: string;
  bank: Bank;
  lessons: Lesson[];
  target: DocTarget;
  zoomReady: boolean;
  boardServer: BoardServer | null;
  ai: boolean;
}) {
  const { t } = useTranslation(call);
  const [warmingUp, setWarmingUp] = useState(false);
  const earlier = previousLesson(lessons);
  const preparing = usePrepared(earlier, bank, ai);
  return (
    <>
      <PageHead title={t('title')}>{t('intro')}</PageHead>
      {/* above the call rather than instead of it: closing a Zoom call's panel would end the call */}
      {warmingUp && <WarmUp bank={bank} lesson={earlier} onClose={() => setWarmingUp(false)} />}
      <div className="lesson-mode">
        <div className="lesson-mode-side">
          <CallPanel docText={docText} zoomReady={zoomReady} />
          {!warmingUp && (
            <WarmUpCard lesson={earlier} preparing={preparing} onStart={() => setWarmingUp(true)} />
          )}
          <LessonWords bank={bank} lesson={lessons[lessons.length - 1] ?? null} />
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
    </>
  );
}
