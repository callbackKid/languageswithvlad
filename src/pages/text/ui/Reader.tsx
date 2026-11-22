import { type MouseEvent, useEffect, useMemo, useState } from 'react';

import { type Analysis } from '@/entities/lesson';
import { normalizeWordCard } from '@/entities/word';
import { CARD_EVENT, cardNote, lookUp, menuPlace, sentenceAround } from '@/features/look-up-word';
import { api, ApiError } from '@/shared/api';
import { getSettings, type Language } from '@/shared/config';
import { common, translator, useTranslation } from '@/shared/i18n';
import { asList, load, save } from '@/shared/lib/storage';
import PageHead from '@/shared/ui/PageHead';
import Speak from '@/shared/ui/Speak';
import WaitingFact from '@/shared/ui/WaitingFact';
import { WordsTab } from '@/widgets/word-list';
import { WordNotesTable } from '@/widgets/word-notes';

import { reader } from '../i18n/reader';
import { normalizeReaderText, normalizeStudy, normalizeTranslation } from '../model/normalize';
import { type ReaderText, type TextStudy } from '../model/types';

const STORAGE_KEY = 'reader:texts';
// Keep in step with MAX_TEXT_LENGTH in api/text.ts.
const MAX_TEXT_LENGTH = 8000;
// The oldest texts are dropped beyond this many, so storage doesn't fill up.
const MAX_TEXTS = 20;
// a word: letters, with apostrophes and hyphens inside (l'ami, peut-être)
const WORD = /(\p{L}[\p{L}\p{M}'’-]*)/u;

type Busy = 'idle' | 'loading' | 'error';
// what the word menu calls the words it explains from this page's text
const WORD_SOURCE = 'reader';

// The first words of a text, for the list of saved texts until Claude names it.
const firstWords = (text: string) => {
  const line = text.trim().split('\n')[0] ?? '';
  return line.length > 60 ? line.slice(0, 57).trimEnd() + '…' : line;
};

// True-or-false statements about the text: each is answered once, then explained.
function TrueFalse({
  statements,
  language,
}: {
  statements: TextStudy['statements'];
  language: Language;
}) {
  const { t } = useTranslation(reader);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const answered = Object.keys(answers).length;
  const score = statements.filter(
    (statement, index) => answers[index] === statement.correct
  ).length;
  return (
    <>
      <ol className="true-false">
        {statements.map((statement, index) => {
          const answer = answers[index];
          const isRight = answer === statement.correct;
          return (
            <li key={statement.text}>
              <p lang={language}>
                {statement.text} <Speak text={statement.text} language={language} />
              </p>
              {answer === undefined ? (
                <div className="seg" role="group" aria-label={t('trueFalseTitle')}>
                  {[true, false].map((choice) => (
                    <button
                      type="button"
                      key={String(choice)}
                      onClick={() => setAnswers({ ...answers, [index]: choice })}
                    >
                      {choice ? t('isTrue') : t('isFalse')}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={'feedback ' + (isRight ? 'ok' : 'bad')}>
                  {isRight ? t('answerRight') : t('answerWrong')}{' '}
                  <b>{statement.correct ? t('isTrue') : t('isFalse')}.</b>{' '}
                  <span lang="ru">{statement.why}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {answered === statements.length && statements.length > 0 && (
        <p className="score">{t('trueFalseScore', { score, total: statements.length })}</p>
      )}
    </>
  );
}

/** A pasted text to read: any word or phrase explained by the word menu (a click on a word, or a
    selection) and kept in a list under the text, a translation of the whole text, and words,
    questions and a true-or-false exercise built from it. */
export default function Reader({ hasClaude }: { hasClaude: boolean }) {
  const { t } = useTranslation(reader);
  const commonText = useTranslation(common);
  const [texts, setTexts] = useState<ReaderText[]>(() =>
    asList(load<unknown>(STORAGE_KEY), normalizeReaderText)
  );
  const [currentId, setCurrentId] = useState<string | null>(() => texts[0]?.id ?? null);
  const [draft, setDraft] = useState('');
  const [translating, setTranslating] = useState<Busy>('idle');
  const [studying, setStudying] = useState<Busy>('idle');
  const [error, setError] = useState('');
  const [showTranslation, setShowTranslation] = useState(true);

  const current = texts.find((entry) => entry.id === currentId) ?? null;
  // until Claude has read the text, guess the first language the student learns
  const language: Language = current?.language ?? getSettings().studying[0] ?? 'fr';
  const paragraphs = useMemo(
    () => (current ? current.text.split(/\n+/).filter((paragraph) => paragraph.trim()) : []),
    [current]
  );
  // single words the student already asked about are underlined in the text
  const asked = useMemo(
    () => new Set((current?.notes ?? []).map((note) => note.fr.toLowerCase())),
    [current]
  );

  // saved whenever the list changes, so answers that arrive together never overwrite each other
  useEffect(() => save(STORAGE_KEY, texts), [texts]);
  // every word the menu explains from this text joins its list; asked again, it moves to the top
  useEffect(() => {
    const onCard = (event: Event) => {
      const detail: unknown = event instanceof CustomEvent ? event.detail : null;
      const source = (detail as { source?: unknown } | null)?.source;
      const card = normalizeWordCard((detail as { card?: unknown } | null)?.card, '');
      if (source !== WORD_SOURCE || !card || !currentId) return;
      setTexts((previous) =>
        previous.map((entry) =>
          entry.id === currentId
            ? {
                ...entry,
                notes: [
                  cardNote(card),
                  ...entry.notes.filter((note) => note.fr.toLowerCase() !== card.fr.toLowerCase()),
                ],
                language: card.language,
              }
            : entry
        )
      );
    };
    window.addEventListener(CARD_EVENT, onCard);
    return () => window.removeEventListener(CARD_EVENT, onCard);
  }, [currentId]);
  // Changes one text, starting from its newest state (an answer may arrive while another is on its way).
  const patch = (id: string, change: (entry: ReaderText) => Partial<ReaderText>) =>
    setTexts((previous) =>
      previous.map((entry) => (entry.id === id ? { ...entry, ...change(entry) } : entry))
    );
  const open = (id: string | null) => {
    setCurrentId(id);
    setError('');
    setTranslating('idle');
    setStudying('idle');
  };
  const failure = (problem: unknown, fallback: 'translateFailed' | 'studyFailed') =>
    setError(problem instanceof ApiError ? problem.message : translator(reader).t(fallback));

  function addText() {
    const text = draft.trim();
    if (!text) return;
    if (text.length > MAX_TEXT_LENGTH) {
      setError(t('tooLong', { count: MAX_TEXT_LENGTH }));
      return;
    }
    const entry: ReaderText = {
      id: Date.now().toString(36),
      title: firstWords(text),
      text,
      at: Date.now(),
      notes: [],
    };
    setTexts([entry, ...texts].slice(0, MAX_TEXTS));
    setDraft('');
    open(entry.id);
  }

  function removeCurrent() {
    if (!current || !window.confirm(t('deleteConfirm', { title: current.title }))) return;
    const next = texts.filter((entry) => entry.id !== current.id);
    setTexts(next);
    open(next[0]?.id ?? null);
  }

  // A click on a word opens the word menu on it; a selection opens it by itself.
  function lookUpWord(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('reader-word')) return;
    if (!window.getSelection()?.isCollapsed) return;
    const word = target.textContent ?? '';
    lookUp({
      text: word,
      context: sentenceAround(target.closest('p')?.textContent ?? '', word),
      language,
      ...menuPlace(target.getBoundingClientRect()),
      source: WORD_SOURCE,
    });
  }

  async function translate() {
    if (!current) return;
    setTranslating('loading');
    setError('');
    try {
      const translated = normalizeTranslation(await api.translate(current.text));
      patch(current.id, () => ({ translation: translated }));
      setShowTranslation(true);
      setTranslating('idle');
    } catch (problem) {
      setTranslating('error');
      failure(problem, 'translateFailed');
    }
  }

  async function study() {
    if (!current) return;
    setStudying('loading');
    setError('');
    try {
      const result = normalizeStudy(await api.study(current.text, getSettings().levels));
      patch(current.id, (entry) => ({
        study: result.study,
        language: result.language,
        title: result.study.title || entry.title,
      }));
      setStudying('idle');
    } catch (problem) {
      setStudying('error');
      failure(problem, 'studyFailed');
    }
  }

  if (!hasClaude)
    return (
      <>
        <PageHead guide="text" title={t('title')}>
          {t('intro')}
        </PageHead>
        <p className="empty">{commonText.t('needsClaude')}</p>
      </>
    );

  // the translation sits under each paragraph when Claude kept the paragraphs apart
  const translation = current?.translation;
  const aligned = !!translation && translation.length === paragraphs.length;
  const studyAnalysis: Analysis | null = current?.study
    ? { language, topic: '', words: current.study.words, pairs: [], verbs: [], local: false }
    : null;

  return (
    <>
      <PageHead guide="text" title={t('title')}>
        {t('intro')}
      </PageHead>

      {!current ? (
        <form
          className="reader-form"
          onSubmit={(event) => {
            event.preventDefault();
            addText();
          }}
        >
          <label className="form-field">
            <span>{t('pasteLabel')}</span>
            <textarea
              rows={10}
              value={draft}
              placeholder={t('pastePlaceholder')}
              onChange={(event) => {
                setDraft(event.target.value);
                setError('');
              }}
            />
          </label>
          <div className="row-actions">
            <button type="submit" className="btn primary" disabled={!draft.trim()}>
              {t('read')}
            </button>
            {texts.length > 0 && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => open(texts[0]?.id ?? null)}
              >
                {commonText.t('cancel')}
              </button>
            )}
            <span className="hint">
              {draft.length} / {MAX_TEXT_LENGTH}
            </span>
          </div>
        </form>
      ) : (
        <>
          <div className="row-actions lead">
            {texts.length > 1 && (
              <select
                className="reader-select"
                aria-label={t('savedTexts')}
                value={current.id}
                onChange={(event) => open(event.target.value)}
              >
                {texts.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            )}
            <button type="button" className="btn" onClick={() => open(null)}>
              {t('newText')}
            </button>
            <button
              type="button"
              className="btn"
              disabled={translating === 'loading'}
              onClick={() =>
                translation ? setShowTranslation(!showTranslation) : void translate()
              }
            >
              {!translation
                ? t('translate')
                : showTranslation
                  ? t('hideTranslation')
                  : t('showTranslation')}
            </button>
            <button type="button" className="btn ghost" onClick={removeCurrent}>
              {t('delete')}
            </button>
          </div>

          <section className="panel solo">
            <div className="body">
              <h2 className="sub-h" lang={language}>
                {current.title}
              </h2>
              <p className="hint">{t('readingHint')}</p>
              {translating === 'loading' && (
                <WaitingFact language={language}>{t('translating')}</WaitingFact>
              )}
              {/* a click on a word, or a selection, opens the word menu; its answers come back to
                  this page as the list of words asked about */}
              <div
                className="reader-text"
                lang={language}
                data-word-source={WORD_SOURCE}
                onClick={lookUpWord}
              >
                {paragraphs.map((paragraph, index) => (
                  <div key={index} className="reader-paragraph">
                    <p>
                      {paragraph.split(WORD).map((part, position) =>
                        // split() with a capturing group puts the words at the odd positions
                        position % 2 ? (
                          <span
                            key={position}
                            className={
                              'reader-word' + (asked.has(part.toLowerCase()) ? ' asked' : '')
                            }
                          >
                            {part}
                          </span>
                        ) : (
                          part
                        )
                      )}
                    </p>
                    {showTranslation && aligned && (
                      <p className="reader-translation" lang="ru">
                        {translation[index]}
                      </p>
                    )}
                  </div>
                ))}
                {showTranslation && translation && !aligned && (
                  <div className="reader-translation" lang="ru">
                    {translation.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="note err" role="alert">
                  <p>{error}</p>
                </div>
              )}

              {current.notes.length > 0 && (
                <>
                  <h3 className="reader-heading">{t('askedTitle')}</h3>
                  <WordNotesTable items={current.notes} firstColumn={t('colMarked')} />
                </>
              )}
            </div>
          </section>

          <section className="panel solo reader-study">
            <div className="body">
              <h2 className="sub-h">{t('exercisesTitle')}</h2>
              {studying === 'loading' ? (
                <WaitingFact language={language}>{t('making')}</WaitingFact>
              ) : (
                <>
                  {!current.study && <p className="hint">{t('exercisesHint')}</p>}
                  <div className="row-actions lead">
                    <button
                      type="button"
                      className={'btn' + (current.study ? '' : ' primary')}
                      onClick={() => void study()}
                    >
                      {current.study ? t('makeAgain') : t('makeExercises')}
                    </button>
                  </div>
                </>
              )}
              {current.study && studyAnalysis && studying !== 'loading' && (
                <>
                  {current.study.words.length > 0 && (
                    <>
                      <h3 className="reader-heading">{t('wordsTitle')}</h3>
                      {/* remounted for a new set of words, so its checkboxes start over */}
                      <WordsTab
                        key={current.id + current.study.words.length}
                        analysis={studyAnalysis}
                        hasClaude={hasClaude}
                        hidePairs
                      />
                    </>
                  )}
                  {current.study.questions.length > 0 && (
                    <>
                      <h3 className="reader-heading">{t('questionsTitle')}</h3>
                      <p className="hint">{t('questionsHint')}</p>
                      <ol className="reader-questions">
                        {current.study.questions.map((item) => (
                          <li key={item.question}>
                            <span lang={language}>{item.question}</span>{' '}
                            <Speak text={item.question} language={language} />
                            {item.ru && (
                              <span className="translation" lang="ru">
                                {item.ru}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                  {current.study.statements.length > 0 && (
                    <>
                      <h3 className="reader-heading">{t('trueFalseTitle')}</h3>
                      <TrueFalse
                        key={current.id + current.study.statements[0]?.text}
                        statements={current.study.statements}
                        language={language}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </section>
        </>
      )}
      {!current && error && (
        <div className="note err" role="alert">
          <p>{error}</p>
        </div>
      )}
    </>
  );
}
