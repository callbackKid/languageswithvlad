import { useState } from 'react';

import { findHomework } from '@/entities/homework';
import { type Lesson } from '@/entities/lesson';
import { getProgress } from '@/entities/word';
import { api, ApiError } from '@/shared/api';
import { common, homework as homeworkText, useTranslation } from '@/shared/i18n';
import { load, save } from '@/shared/lib/storage';
import { Button } from '@/shared/ui/controls';

import { buildReport } from '../model/report';

type Step = 'idle' | 'review' | 'saving' | 'done';

/** "Send to the teacher": a short report on everything since the newest lesson, checked by the
    student, then added to the document under that lesson for the teacher to read. */
export default function SendToTeacher({
  lessons,
  docId,
  canWrite,
}: {
  lessons: Lesson[];
  docId: string;
  // whether the server can write to the document
  canWrite: boolean;
}) {
  const { t, locale } = useTranslation(homeworkText);
  const commonText = useTranslation(common);
  const lesson = lessons[lessons.length - 1];
  const sentKey = lesson ? `report-sent:${docId}:${lesson.key}` : '';
  const [step, setStep] = useState<Step>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sentAt, setSentAt] = useState(() => (sentKey ? load<number>(sentKey) : null));
  if (!lesson) return null;

  const prepare = () => {
    setText(
      buildReport({ lesson, homework: findHomework(lessons), docId, progress: getProgress() })
    );
    setError('');
    setStep('review');
  };
  async function add() {
    if (!lesson) return;
    setStep('saving');
    setError('');
    try {
      await api.append(docId, text, lesson.key);
      const now = Date.now();
      save(sentKey, now);
      setSentAt(now);
      setStep('done');
      // the app syncs, and the teacher's document has the report under the lesson
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (failure) {
      setStep('review');
      setError(failure instanceof ApiError ? failure.message : commonText.t('addFailed'));
    }
  }
  const sentDate =
    sentAt &&
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(sentAt);

  return (
    <section className="send-to-teacher">
      <h3>{t('sendTitle')}</h3>
      {!canWrite ? (
        <p className="hint">{commonText.t('docWriterMissing')}</p>
      ) : (
        <>
          <p className="hint">{t('sendHint', { n: lesson.n })}</p>
          {(step === 'idle' || step === 'done') && (
            <div className="row-actions">
              <Button onClick={prepare}>{t('prepareReport')}</Button>
              {sentDate && <span className="hint">{t('lastSent', { date: sentDate })}</span>}
            </div>
          )}
          {(step === 'review' || step === 'saving') && (
            <>
              <textarea
                className="notes report-text"
                value={text}
                aria-label={t('reportLabel')}
                onChange={(event) => setText(event.target.value)}
              />
              <div className="row-actions">
                <Button
                  variant="primary"
                  disabled={step === 'saving' || !text.trim()}
                  onClick={() => void add()}
                >
                  {step === 'saving' ? commonText.t('adding') : t('addReport')}
                </Button>
                <Button
                  variant="ghost"
                  disabled={step === 'saving'}
                  onClick={() => setStep('idle')}
                >
                  {commonText.t('cancel')}
                </Button>
              </div>
            </>
          )}
          {step === 'done' && (
            <p className="hint" role="status">
              {t('reportAdded', { n: lesson.n })}
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
