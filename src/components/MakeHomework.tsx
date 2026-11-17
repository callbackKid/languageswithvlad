import { useState } from 'react';

import { translator, useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { homework as homeworkText } from '../i18n/messages/homework';
import { api, ApiError } from '../lib/api';
import { homeworkBlock, homeworkLabel } from '../lib/makeHomework';
import { getSettings } from '../lib/settings';
import type { Language, Lesson, Word } from '../lib/types';
import WaitingFact from './WaitingFact';

type Step = 'idle' | 'making' | 'review' | 'saving' | 'done';

/** "Make homework with Claude": a Devoirs: block from the lesson's words and grammar, key words
    first, checked and edited by the teacher, then written under the lesson in the document. */
export default function MakeHomework({
  lesson,
  words,
  language,
  docId,
  docWriter,
  ai,
}: {
  lesson: Lesson;
  /** the lesson's words, key words (★) marked */
  words: Word[];
  language: Language;
  docId: string;
  /** whether the server can write to this document */
  docWriter: boolean;
  ai: boolean;
}) {
  const { t } = useTranslation(homeworkText);
  const commonText = useTranslation(common);
  const [step, setStep] = useState<Step>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  async function make() {
    setStep('making');
    setError('');
    try {
      const raw = await api.makeHomework({
        body: lesson.body,
        keyWords: words.filter((word) => word.key).map((word) => word.fr),
        level: getSettings().levels[language],
      });
      setText(homeworkBlock({ raw, lessonNumber: lesson.n, words, gaps: ai }));
      setStep('review');
    } catch (failure) {
      setStep('idle');
      // read at the moment of failure, so a new interface language is used
      setError(
        failure instanceof ApiError ? failure.message : translator(homeworkText).t('makeFailed')
      );
    }
  }
  async function add() {
    setStep('saving');
    setError('');
    try {
      await api.append(docId, text, lesson.key);
      setStep('done');
      // the app syncs: the lesson gets its homework, and Home its checklist
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (failure) {
      setStep('review');
      setError(failure instanceof ApiError ? failure.message : commonText.t('addFailed'));
    }
  }

  return (
    <section className="make-homework">
      <h2>{t('makeTitle')}</h2>
      {!docWriter ? (
        <p className="hint">{commonText.t('docWriterMissing')}</p>
      ) : (
        <>
          <p className="hint">{t('makeHint', { label: homeworkLabel(language) })}</p>
          {(step === 'idle' || step === 'done') && (
            <div className="row-actions">
              <button type="button" className="btn" onClick={() => void make()}>
                {t('makeButton')}
              </button>
            </div>
          )}
          {step === 'making' && <WaitingFact language={language}>{t('making')}</WaitingFact>}
          {(step === 'review' || step === 'saving') && (
            <>
              <textarea
                className="notes homework-text"
                lang={language}
                value={text}
                aria-label={t('homeworkLabel')}
                onChange={(event) => setText(event.target.value)}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="btn primary"
                  disabled={step === 'saving' || !text.trim()}
                  onClick={() => void add()}
                >
                  {step === 'saving' ? commonText.t('adding') : t('addToLesson')}
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={step === 'saving'}
                  onClick={() => void make()}
                >
                  {t('makeAgain')}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={step === 'saving'}
                  onClick={() => setStep('idle')}
                >
                  {commonText.t('cancel')}
                </button>
              </div>
            </>
          )}
          {step === 'done' && (
            <p className="hint" role="status">
              {t('homeworkAdded', { n: lesson.n })}
            </p>
          )}
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}
