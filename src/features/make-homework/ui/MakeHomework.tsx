import { useState } from 'react';

import { type Lesson } from '@/entities/lesson';
import { type Word } from '@/entities/word';
import { api, ApiError } from '@/shared/api';
import { asUiLanguage, getSettings, type Language, type Level, LEVELS } from '@/shared/config';
import {
  common,
  homework as homeworkText,
  translator,
  UI_LANGUAGES,
  type UiLanguage,
  useTranslation,
} from '@/shared/i18n';
import { load, save } from '@/shared/lib/storage';
import { Button, Select, Textarea } from '@/shared/ui/controls';
import WaitingFact from '@/shared/ui/WaitingFact';

import {
  homeworkBlock,
  homeworkLabel,
  MAX_TRANSLATE_SENTENCES,
  MIN_TRANSLATE_SENTENCES,
} from '../model/makeHomework';

type Step = 'idle' | 'making' | 'review' | 'saving' | 'done';

const DEFAULT_TRANSLATE_SENTENCES = 4;
// The language of the sentences to translate the teacher chose last, kept on this device.
const TRANSLATE_TO_KEY = 'homework:translate-to';

/** The teacher's last choice when it is still one of the languages, their own translation
    language otherwise. */
const savedTranslateTo = (): UiLanguage => {
  return asUiLanguage(load<unknown>(TRANSLATE_TO_KEY)) ?? getSettings().translateTo;
};

const SENTENCE_COUNTS = Array.from(
  { length: MAX_TRANSLATE_SENTENCES - MIN_TRANSLATE_SENTENCES + 1 },
  (_empty, position) => MIN_TRANSLATE_SENTENCES + position
);

/** "Make homework with Claude": a Devoirs: block from the lesson's words and grammar, key words
    first, checked and edited by the teacher, then written under the lesson in the document. */
const MakeHomework = ({
  lesson,
  words,
  language,
  docId,
  docWriter,
  hasClaude,
}: {
  lesson: Lesson;
  // the lesson's words, key words (★) marked
  words: Word[];
  language: Language;
  docId: string;
  // whether the server can write to this document
  docWriter: boolean;
  hasClaude: boolean;
}) => {
  const { t } = useTranslation(homeworkText);
  const commonText = useTranslation(common);
  const [step, setStep] = useState<Step>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sentences, setSentences] = useState(DEFAULT_TRANSLATE_SENTENCES);
  // the teacher's own level for this language to start with; the student's may differ
  const [level, setLevel] = useState<Level>(() => getSettings().levels[language]);
  const [translateTo, setTranslateTo] = useState<UiLanguage>(savedTranslateTo);

  const make = async () => {
    setStep('making');
    setError('');
    try {
      const raw = await api.makeHomework({
        body: lesson.body,
        keyWords: words.filter((word) => word.key).map((word) => word.fr),
        level,
        sentences,
        translateTo,
      });
      setText(homeworkBlock({ raw, lessonNumber: lesson.n, words, gaps: hasClaude }));
      setStep('review');
    } catch (failure) {
      setStep('idle');
      // read at the moment of failure, so a new interface language is used
      setError(
        failure instanceof ApiError ? failure.message : translator(homeworkText).t('makeFailed')
      );
    }
  };
  const add = async () => {
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
  };

  return (
    <section className="make-homework">
      <h2>{t('makeTitle')}</h2>
      {!docWriter ? (
        <p className="hint">{commonText.t('docWriterMissing')}</p>
      ) : (
        <>
          <p className="hint">{t('makeHint', { label: homeworkLabel(language) })}</p>
          {(step === 'idle' || step === 'done' || step === 'review') && (
            <div className="make-homework-options">
              <label className="form-field">
                <span>{t('makeSentences')}</span>
                <Select
                  value={sentences}
                  onChange={(event) => setSentences(Number(event.target.value))}
                >
                  {SENTENCE_COUNTS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="form-field">
                <span>{t('makeLevel')}</span>
                <Select
                  value={level}
                  onChange={(event) =>
                    setLevel(
                      LEVELS.includes(event.target.value as Level)
                        ? (event.target.value as Level)
                        : level
                    )
                  }
                >
                  {LEVELS.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="form-field">
                <span>{t('makeTranslateTo')}</span>
                <Select
                  value={translateTo}
                  onChange={(event) => {
                    const chosen = UI_LANGUAGES.find((option) => option.id === event.target.value);
                    if (!chosen) return;
                    setTranslateTo(chosen.id);
                    save(TRANSLATE_TO_KEY, chosen.id);
                  }}
                >
                  {UI_LANGUAGES.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.flag} {option.name}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          )}
          {(step === 'idle' || step === 'done') && (
            <div className="row-actions">
              <Button onClick={() => void make()}>{t('makeButton')}</Button>
            </div>
          )}
          {step === 'making' && <WaitingFact language={language}>{t('making')}</WaitingFact>}
          {(step === 'review' || step === 'saving') && (
            <>
              <Textarea
                className="notes homework-text"
                lang={language}
                value={text}
                aria-label={t('homeworkLabel')}
                onChange={(event) => setText(event.target.value)}
              />
              <div className="row-actions">
                <Button
                  variant="primary"
                  disabled={step === 'saving' || !text.trim()}
                  onClick={() => void add()}
                >
                  {step === 'saving' ? commonText.t('adding') : t('addToLesson')}
                </Button>
                <Button disabled={step === 'saving'} onClick={() => void make()}>
                  {t('makeAgain')}
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
};

export default MakeHomework;
