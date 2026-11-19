import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { exercises } from '../i18n/messages/exercises';
import { ApiError } from '../lib/api';
import { fetchConjugation, readConjugation, verbLanguageOf } from '../lib/bank';
import { type Grade, grade } from '../lib/grade';
import { negate } from '../lib/negation';
import { recordForm } from '../lib/progress';
import { type FormQuestion, verbForms } from '../lib/quiz';
import {
  COMPOUND_PAST,
  type Conjugation,
  type Form,
  languageOfTense,
  type Tense,
  TENSES_BY_LANGUAGE,
  type VerbLanguage,
  type VerbRef,
} from '../lib/types';
import { keepBracketsTogether, shuffle } from '../lib/util';
import ExerciseHead from './ExerciseHead';
import Speak from './Speak';
import WaitingFact from './WaitingFact';

export default function VerbsTab({
  verbs,
  hasClaude,
  waiting,
}: {
  verbs: VerbRef[];
  hasClaude: boolean;
  waiting: boolean;
}) {
  const { t, rich } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const [currentVerb, setCurrentVerb] = useState<string | null>(null);
  const [tense, setTense] = useState<Tense>('présent');
  const [isNegative, setIsNegative] = useState(false);
  const [conjugations, setConjugations] = useState<Record<string, Conjugation>>(() => {
    const out: Record<string, Conjugation> = {};
    for (const verb of verbs) {
      const conjugation = readConjugation(verb.inf, verbLanguageOf(verb));
      if (conjugation) out[verb.inf] = conjugation;
    }
    return out;
  });
  const [status, setStatus] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'table' | 'drill' | 'quiz'>('table');

  /** fresh: ignore the saved table and ask Claude again */
  async function open(verb: VerbRef, fresh = false) {
    setCurrentVerb(verb.inf);
    setMode('table');
    if (status[verb.inf] === 'loading') return;
    if (!fresh) {
      if (conjugations[verb.inf]) return;
      const cached = readConjugation(verb.inf, verbLanguageOf(verb));
      if (cached) {
        setConjugations((previous) => ({ ...previous, [verb.inf]: cached }));
        return;
      }
    }
    if (!hasClaude) {
      setStatus((previous) => ({
        ...previous,
        [verb.inf]: commonText.t('needsClaude'),
      }));
      return;
    }
    setStatus((previous) => ({ ...previous, [verb.inf]: 'loading' }));
    try {
      const conjugation = await fetchConjugation(verb, fresh);
      setConjugations((previous) => ({ ...previous, [verb.inf]: conjugation }));
      setStatus((previous) => {
        const copy = { ...previous };
        delete copy[verb.inf];
        return copy;
      });
    } catch (error) {
      setStatus((previous) => ({
        ...previous,
        [verb.inf]: error instanceof ApiError ? error.message : commonText.t('unreadable'),
      }));
    }
  }

  if (!verbs.length)
    return waiting ? null : (
      <p className="empty">{hasClaude ? t('noVerbs') : commonText.t('needsClaude')}</p>
    );
  const loaded = verbs.filter((verb) => conjugations[verb.inf]);

  if (mode === 'quiz')
    return (
      <Quiz
        conjugations={loaded.flatMap((verb) => conjugations[verb.inf] ?? [])}
        onClose={() => setMode('table')}
      />
    );

  const shownConjugation = currentVerb ? conjugations[currentVerb] : null;
  const shownStatus = currentVerb ? status[currentVerb] : undefined;
  const currentReference = verbs.find((verb) => verb.inf === currentVerb);
  const language =
    shownConjugation?.language ?? (currentReference ? verbLanguageOf(currentReference) : 'fr');
  const tenses: readonly Tense[] = TENSES_BY_LANGUAGE[language];
  // after a verb of another language the chosen tense may not exist here: the first one instead
  const shownTense = tenses.includes(tense) ? tense : (tenses[0] ?? tense);
  const compoundPast = COMPOUND_PAST[language];
  // negate knows French word order only
  const canNegate = language === 'fr';
  const showNegative = isNegative && canNegate;
  const affirmativeRows = shownConjugation ? shownConjugation.tenses[shownTense] || [] : [];
  const rows = showNegative
    ? affirmativeRows.map((row) => negate(row, shownTense))
    : affirmativeRows;

  return (
    <>
      <div className="verbs">
        {verbs.map((verb) => (
          <button
            type="button"
            key={verb.inf}
            className="verb"
            aria-pressed={currentVerb === verb.inf}
            onClick={() => void open(verb)}
          >
            <span className="fr" lang={verbLanguageOf(verb)}>
              {verb.inf}
            </span>
            <span className="ru" lang="ru">
              {verb.ru}
            </span>
          </button>
        ))}
      </div>
      <div className="row-actions quiz-bar">
        <button
          type="button"
          className="btn"
          disabled={!loaded.length}
          onClick={() => setMode('quiz')}
        >
          {t('quickQuiz')}
        </button>
        <span className="hint">
          {loaded.length ? t('usesVerbs', { count: loaded.length }) : t('openVerbFirst')}
        </span>
      </div>

      {!currentVerb && <p className="empty">{t('pickVerb')}</p>}
      {shownStatus === 'loading' && (
        <WaitingFact>
          {rich(
            'conjugating',
            { i: (chunk) => <i lang={language}>{chunk}</i> },
            { verb: currentVerb }
          )}
        </WaitingFact>
      )}
      {shownStatus && shownStatus !== 'loading' && (
        <div className="note err">
          <p>{shownStatus}</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const verb = verbs.find((candidate) => candidate.inf === currentVerb);
              if (verb) {
                setStatus((previous) => {
                  const copy = { ...previous };
                  delete copy[verb.inf];
                  return copy;
                });
                void open(verb);
              }
            }}
          >
            {commonText.t('tryAgain')}
          </button>
        </div>
      )}

      {shownConjugation && (
        <>
          <div className="conj-head">
            <h2 lang={language}>{shownConjugation.inf}</h2>
            <span className="ru" lang="ru">
              {shownConjugation.ru}
            </span>
          </div>
          <p className="conj-meta">
            {shownConjugation.pp &&
              rich(
                'pastParticiple',
                { i: (chunk) => <i lang={language}>{chunk}</i> },
                { pp: shownConjugation.pp }
              )}
            {shownConjugation.aux &&
              compoundPast &&
              rich(
                'withAux',
                { i: (chunk) => <i lang={language}>{chunk}</i> },
                { aux: shownConjugation.aux, tense: compoundPast }
              )}
            {hasClaude && (
              <>
                {' '}
                ·{' '}
                <button
                  type="button"
                  className="btn ghost flush inline"
                  data-tooltip={t('conjugateAgainTitle')}
                  onClick={() => {
                    const verb = verbs.find((candidate) => candidate.inf === currentVerb);
                    if (verb) void open(verb, true);
                  }}
                >
                  {t('conjugateAgain')}
                </button>
              </>
            )}
          </p>
          <div className="tense-tabs" role="group" aria-label={t('tense')}>
            {tenses.map((tenseOption) => (
              <button
                type="button"
                key={tenseOption}
                aria-pressed={shownTense === tenseOption}
                disabled={!(shownConjugation.tenses[tenseOption] || []).length}
                onClick={() => setTense(tenseOption)}
              >
                {tenseOption}
              </button>
            ))}
          </div>
          {canNegate && (
            <div className="tense-tabs" role="group" aria-label={t('sentenceType')}>
              <button type="button" aria-pressed={!isNegative} onClick={() => setIsNegative(false)}>
                {t('affirmative')}
              </button>
              <button type="button" aria-pressed={isNegative} onClick={() => setIsNegative(true)}>
                {commonText.t('negative')}
              </button>
            </div>
          )}
          {!rows.length ? (
            <p className="empty">{t('noTense', { tense: shownTense })}</p>
          ) : mode === 'drill' ? (
            <Drill
              key={shownConjugation.inf + shownTense + showNegative}
              inf={shownConjugation.inf}
              tense={shownTense}
              language={language}
              isNegative={showNegative}
              rows={rows}
              onStop={() => setMode('table')}
            />
          ) : (
            <>
              <table className="conj" lang={language}>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="p">{row.p}</td>
                      <td className="f">
                        <div className="conj-form">
                          <span>{keepBracketsTogether(row.f)}</span>
                          <Speak text={`${row.p} ${row.f}`} language={language} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="row-actions">
                <button type="button" className="btn primary" onClick={() => setMode('drill')}>
                  {t('practiseTense')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

function Drill({
  inf,
  tense,
  language,
  isNegative,
  rows,
  onStop,
}: {
  inf: string;
  tense: Tense;
  language: VerbLanguage;
  isNegative: boolean;
  rows: Form[];
  onStop: () => void;
}) {
  const { t } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const [values, setValues] = useState<string[]>(() => rows.map(() => ''));
  const [checked, setChecked] = useState(false);
  const [round, setRound] = useState(0);
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus();
  }, [round]);

  const results: Grade[] = checked
    ? rows.map((row, index) => grade(values[index] ?? '', row.f, row.p))
    : [];
  const score = results.filter((result) => result === 'ok').length;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setChecked(true);
        // blank rows and accent slips don't count either way
        rows.forEach((row, index) => {
          const result = grade(values[index] ?? '', row.f, row.p);
          if (result === 'ok' || result === 'bad')
            recordForm(inf, tense, row.p, row.f, result === 'ok', isNegative);
        });
      }}
    >
      <table className="conj" lang={language}>
        <tbody>
          {rows.map((row, index) => {
            const result = results[index];
            const inputClass = result === 'empty' ? 'bad' : result || '';
            return (
              <tr key={index}>
                <td className="p">{row.p}</td>
                <td>
                  <input
                    ref={index === 0 ? first : undefined}
                    className={inputClass}
                    value={values[index]}
                    aria-label={row.p}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={checked}
                    onChange={(event) =>
                      setValues((previous) =>
                        previous.map((value, position) =>
                          position === index ? event.target.value : value
                        )
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && index < rows.length - 1) {
                        event.preventDefault();
                        (
                          event.currentTarget.closest('tbody')?.querySelectorAll('input')[
                            index + 1
                          ] as HTMLInputElement | undefined
                        )?.focus();
                      }
                    }}
                  />
                  {(result === 'bad' || result === 'empty') && (
                    <div className="fix bad">{keepBracketsTogether(row.f)}</div>
                  )}
                  {result === 'accent' && (
                    <div className="fix accent">{t('mindAccents', { form: row.f })}</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="row-actions">
        {checked ? (
          <>
            <span className="score">
              {commonText.t('scoreLine', { score, total: rows.length })}
            </span>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setValues(rows.map(() => ''));
                setChecked(false);
                setRound((previous) => previous + 1);
              }}
            >
              {commonText.t('tryAgain')}
            </button>
          </>
        ) : (
          <button type="submit" className="btn primary">
            {t('checkAnswers')}
          </button>
        )}
        <button type="button" className="btn ghost" onClick={onStop}>
          {t('showTable')}
        </button>
      </div>
    </form>
  );
}

function makeQuiz(conjugations: Conjugation[]): FormQuestion[] {
  return shuffle(conjugations.flatMap(verbForms)).slice(0, 10);
}

function Quiz({ conjugations, onClose }: { conjugations: Conjugation[]; onClose: () => void }) {
  const { t } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const [questions, setQuestions] = useState(() => makeQuiz(conjugations));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, [index]);

  const head = (
    <ExerciseHead title={t('quickQuiz')} onClose={onClose} closeLabel={t('backToVerbs')}>
      <span className="progress">
        {Math.min(index + 1, questions.length)} / {questions.length}
      </span>
    </ExerciseHead>
  );
  const question = questions[index];
  // past the last question: the round is over
  if (!question)
    return (
      <div className="ex">
        {head}
        <p className="score">{commonText.t('scoreLine', { score, total: questions.length })}</p>
        <div className="row-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setQuestions(makeQuiz(conjugations));
              setIndex(0);
              setScore(0);
              setTyped('');
              setResult(null);
            }}
          >
            {t('newQuiz')}
          </button>
        </div>
      </div>
    );
  const next = () => {
    setIndex((previous) => previous + 1);
    setTyped('');
    setResult(null);
  };
  const questionLanguage = languageOfTense(question.t);
  return (
    <div className="ex">
      {head}
      <p className="quiz-q">
        <b lang={questionLanguage}>{question.inf}</b>, {question.t}
        {question.negative && `, ${commonText.t('negative')}`}
      </p>
      <form
        className="quiz-input"
        onSubmit={(event) => {
          event.preventDefault();
          if (result) return next();
          const grading = grade(typed, question.f, question.p);
          if (grading === 'empty') return;
          setResult(grading);
          if (grading === 'ok') setScore((previous) => previous + 1);
          if (grading === 'ok' || grading === 'bad')
            recordForm(
              question.inf,
              question.t,
              question.p,
              question.f,
              grading === 'ok',
              question.negative
            );
        }}
      >
        <span className="p" lang={questionLanguage}>
          {question.p}
        </span>
        <input
          ref={input}
          lang={questionLanguage}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          readOnly={!!result}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={commonText.t('yourAnswer')}
        />
        <button className="btn primary" type="submit">
          {result ? commonText.t('next') : commonText.t('check')}
        </button>
      </form>
      {result === 'ok' && <p className="feedback ok">{commonText.t('right')}</p>}
      {result === 'accent' && (
        <p className="feedback warn">
          {commonText.rich(
            'almostAccents',
            { b: (chunk) => <b lang={questionLanguage}>{chunk}</b> },
            { answer: `${question.p} ${question.f}` }
          )}
        </p>
      )}
      {result === 'bad' && (
        <p className="feedback bad">
          {commonText.rich(
            'answerIs',
            { b: (chunk) => <b lang={questionLanguage}>{chunk}</b> },
            { answer: `${question.p} ${question.f}` }
          )}
        </p>
      )}
    </div>
  );
}
