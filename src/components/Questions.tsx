import { type FormEvent, useRef, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { questionsText } from '../i18n/messages/questions';
import { api, ApiError } from '../lib/api';
import { lessonQuestions, questionsBlock, readQuestions, saveQuestions } from '../lib/questions';
import { getSettings } from '../lib/settings';
import type { Lesson } from '../lib/types';

// one question is a sentence or two
const MAX_QUESTION_LENGTH = 300;

/** ❓ in the top bar: questions for the next lesson, written down whenever they come up and
    added to the document under the newest lesson before the lesson. */
export function QuestionsButton({
  docId,
  lesson,
  canWrite,
}: {
  docId: string;
  // the newest lesson: the questions go under it
  lesson: Lesson | null;
  canWrite: boolean;
}) {
  const { t } = useTranslation(questionsText);
  const commonText = useTranslation(common);
  const dialog = useRef<HTMLDialogElement>(null);
  const [questions, setQuestions] = useState(() => readQuestions(docId));
  const [draft, setDraft] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const keep = (next: typeof questions) => {
    setQuestions(next);
    saveQuestions(docId, next);
  };
  const add = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    keep([...questions, { text, at: Date.now() }]);
    setDraft('');
    setState('idle');
  };
  async function send() {
    if (!lesson || !questions.length) return;
    setState('sending');
    setError('');
    const name = getSettings().name.trim();
    const heading = name ? t('blockHeadingNamed', { name }) : t('blockHeading');
    try {
      await api.append(docId, questionsBlock(heading, questions), lesson.key);
      keep([]);
      setState('sent');
      // the app syncs, and lesson mode shows the questions from the document
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (failure) {
      setState('idle');
      setError(failure instanceof ApiError ? failure.message : commonText.t('addFailed'));
    }
  }
  const open = () => {
    // another tab or lesson mode may have changed them
    setQuestions(readQuestions(docId));
    setState('idle');
    setError('');
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        className="icon-button questions-button"
        onClick={open}
        data-tooltip={t('button')}
        aria-label={t('button')}
      >
        <span aria-hidden="true">❓</span>
        {questions.length > 0 && <span className="count">{questions.length}</span>}
      </button>
      <dialog
        ref={dialog}
        className="report-dialog"
        aria-labelledby="questions-title"
        // a click on the dimmed area around the form closes it
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
      >
        <div className="report-body">
          <h2 id="questions-title">{t('title')}</h2>
          <p className="hint">{t('intro')}</p>
          <form className="question-add" onSubmit={add}>
            <input
              type="text"
              value={draft}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit" className="btn" disabled={!draft.trim()}>
              {t('add')}
            </button>
          </form>
          {questions.length ? (
            <ul className="question-list">
              {questions.map((question) => (
                <li key={question.at}>
                  <span>{question.text}</span>
                  <button
                    type="button"
                    className="btn ghost"
                    data-tooltip={t('remove')}
                    aria-label={t('remove')}
                    onClick={() => keep(questions.filter((item) => item.at !== question.at))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            state !== 'sent' && <p className="hint">{t('none')}</p>
          )}
          {state === 'sent' && (
            <p className="hint" role="status">
              {t('sent')}
            </p>
          )}
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          {!canWrite && questions.length > 0 && (
            <p className="hint">{commonText.t('docWriterMissing')}</p>
          )}
          <div className="row-actions">
            {canWrite && lesson && questions.length > 0 && (
              <button
                type="button"
                className="btn primary"
                disabled={state === 'sending'}
                onClick={() => void send()}
              >
                {state === 'sending' ? commonText.t('adding') : t('send', { n: lesson.n })}
              </button>
            )}
            <button type="button" className="btn ghost" onClick={close}>
              {commonText.t('close')}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/** Lesson mode: the questions the student added to the document for this lesson, and the ones
    still only on this device, so the lesson starts with them. */
export function QuestionsCard({ docId, lessons }: { docId: string; lessons: Lesson[] }) {
  const { t } = useTranslation(questionsText);
  // the questions go under the newest lesson; once today's lesson is in the document they are
  // under the one before it
  const fromDocument = [...new Set(lessons.slice(-2).flatMap((lesson) => lessonQuestions(lesson)))];
  const onDevice = readQuestions(docId).map((question) => question.text);
  if (!fromDocument.length && !onDevice.length) return null;
  return (
    <section className="call-card questions-card">
      <h2>{t('cardTitle')}</h2>
      <p className="hint">{t('cardHint')}</p>
      <ul className="question-list">
        {fromDocument.map((question) => (
          <li key={'d' + question}>
            <span>{question}</span>
          </li>
        ))}
        {onDevice.map((question) => (
          <li key={'l' + question} className="local">
            <span>{question}</span>
          </li>
        ))}
      </ul>
      {onDevice.length > 0 && <p className="legend">{t('notSent')}</p>}
    </section>
  );
}
