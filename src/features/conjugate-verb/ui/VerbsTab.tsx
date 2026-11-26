import { useEffect, useRef, useState } from 'react';

import {
  type FormQuestion,
  removedCount,
  removeVerb,
  restore,
  useRemoved,
  verbForms,
  verbLanguageOf,
} from '@/entities/lesson';
import {
  type Conjugation,
  ConjugationTable,
  type Form,
  negate,
  sortVerbs,
  VERB_SORTS,
  verbGroup,
  type VerbRef,
  type VerbSort,
} from '@/entities/verb';
import { recordForm } from '@/entities/word';
import { ApiError } from '@/shared/api';
import {
  COMPOUND_PAST,
  languageOfTense,
  type Tense,
  TENSES_BY_LANGUAGE,
  type VerbLanguage,
} from '@/shared/config';
import { common, exercises, useTranslation } from '@/shared/i18n';
import { type Grade, grade } from '@/shared/lib/grade';
import { load, save } from '@/shared/lib/storage';
import { keepBracketsTogether, shuffle } from '@/shared/lib/util';
import { Button, IconButton } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import InlineConfirm from '@/shared/ui/InlineConfirm';
import WaitingFact from '@/shared/ui/WaitingFact';

import { useVerbConjugations, verbIdentity } from '../model/useVerbConjugations';

// the order of the verb list, kept on the device for every lesson
const SORT_KEY = 'verb-sort';
const savedSort = (): VerbSort => {
  const stored = load<unknown>(SORT_KEY);
  return VERB_SORTS.includes(stored as VerbSort) ? (stored as VerbSort) : 'alphabet';
};

/** A lesson's verbs as a list, in alphabetical order or by group (1, 2, 3), with a table in each
    tense, a typing drill per tense and a quick quiz. */
export default function VerbsTab({
  verbs,
  hasClaude,
  waiting,
  openFirst = false,
  lessonKey,
}: {
  verbs: VerbRef[];
  hasClaude: boolean;
  waiting: boolean;
  // open the first verb's table at once, as for the one verb looked up from a word's menu
  openFirst?: boolean;
  // one lesson's own verbs: they can be taken out of it (✕) and brought back
  lessonKey?: string;
}) {
  const { t, rich, language: uiLanguage } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const { lookup, load: loadTable, translationOf } = useVerbConjugations(verbs, hasClaude);
  const [currentVerb, setCurrentVerb] = useState<string | null>(null);
  // the verb whose ✕ was pressed: its row asks before taking it out
  const [removing, setRemoving] = useState<string | null>(null);
  const [tense, setTense] = useState<Tense>('présent');
  const [isNegative, setIsNegative] = useState(false);
  const [mode, setMode] = useState<'table' | 'drill' | 'quiz'>('table');
  const [sort, setSort] = useState<VerbSort>(savedSort);
  const removedVerbs = removedCount(useRemoved(), 'verbs', lessonKey ? [lessonKey] : []);

  const currentReference = verbs.find((verb) => verbIdentity(verb) === currentVerb);
  const currentTable = currentReference ? lookup(currentReference) : null;
  const shownConjugation = currentTable?.table;
  const request = currentTable?.request;
  const openedFirst = useRef(false);
  const requestedTable = useRef<string | null>(null);
  useEffect(() => {
    if (openFirst && !openedFirst.current && verbs[0]) {
      openedFirst.current = true;
      setCurrentVerb(verbIdentity(verbs[0]));
    }
  }, [openFirst, verbs]);
  useEffect(() => {
    const key = currentReference
      ? `${verbIdentity(currentReference)}:${translationOf(verbLanguageOf(currentReference))}`
      : null;
    if (key === requestedTable.current) return;
    requestedTable.current = key;
    if (currentReference) void loadTable(currentReference);
  }, [currentReference, loadTable, translationOf]);

  function open(verb: VerbRef) {
    setCurrentVerb(verbIdentity(verb));
    setMode('table');
  }

  // under the list, and in place of it once every verb is taken out
  const restoreLink = lessonKey && removedVerbs > 0 && (
    <p className="legend legend-actions">
      <Button variant="ghost" onClick={() => restore('verbs', [lessonKey])}>
        {t('restoreVerbs', { count: removedVerbs })}
      </Button>
    </p>
  );
  if (!verbs.length)
    return waiting ? null : (
      <>
        <p className="empty">{hasClaude ? t('noVerbs') : commonText.t('needsClaude')}</p>
        {restoreLink}
      </>
    );
  const loaded = verbs.flatMap((verb) => lookup(verb).table ?? []);

  if (mode === 'quiz') return <Quiz conjugations={loaded} onClose={() => setMode('table')} />;

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

  // a French -ir verb whose table is loaded is placed by its nous form
  const groupOf = (verb: VerbRef) => verbGroup(verb.inf, verbLanguageOf(verb), lookup(verb).table);
  // German verbs have no groups: then the list is alphabetical, with nothing to choose
  const hasGroups = verbs.some((verb) => groupOf(verb) !== null);
  const shownSort: VerbSort = hasGroups ? sort : 'alphabet';
  const sections = sortVerbs(verbs, shownSort, groupOf, uiLanguage);

  return (
    <>
      {hasGroups && verbs.length > 1 && (
        <div className="seg verb-sort" role="group" aria-label={t('sortVerbs')}>
          {VERB_SORTS.map((option) => (
            <Button
              variant="unstyled"
              key={option}
              aria-pressed={shownSort === option}
              onClick={() => {
                setSort(option);
                save(SORT_KEY, option);
              }}
            >
              {t(option === 'alphabet' ? 'sortAlphabet' : 'sortByGroup')}
            </Button>
          ))}
        </div>
      )}
      {sections.map((section) => {
        const name = section.group ? t('verbGroup', { n: section.group }) : t('noVerbGroup');
        return (
          <section
            key={section.group ?? 'none'}
            className="verb-group"
            aria-label={shownSort === 'group' ? name : undefined}
          >
            {shownSort === 'group' && <h3 className="verb-group-name">{name}</h3>}
            <ul className="verbs">
              {section.verbs.map((verb) => (
                <li key={verbIdentity(verb)} className="verb-row">
                  <Button
                    variant="unstyled"
                    className="verb"
                    aria-pressed={currentVerb === verbIdentity(verb)}
                    onClick={() => void open(verb)}
                  >
                    <span className="fr" lang={verbLanguageOf(verb)}>
                      {verb.inf}
                    </span>
                    <span
                      className="ru"
                      data-no-word-actions
                      lang={translationOf(verbLanguageOf(verb))}
                    >
                      {verb.ru}
                    </span>
                  </Button>
                  {lessonKey && (
                    <IconButton
                      className="row-remove"
                      tooltip={t('removeWord')}
                      label={t('removeWordLabel', { word: verb.inf })}
                      aria-expanded={removing === verbIdentity(verb)}
                      onClick={() =>
                        setRemoving(removing === verbIdentity(verb) ? null : verbIdentity(verb))
                      }
                    >
                      ✕
                    </IconButton>
                  )}
                  {lessonKey && removing === verbIdentity(verb) && (
                    <InlineConfirm
                      question={t('removeWordConfirm', { word: verb.inf })}
                      yesLabel={t('removeWord')}
                      onYes={() => {
                        removeVerb(lessonKey, verb.inf);
                        if (currentVerb === verbIdentity(verb)) setCurrentVerb(null);
                        setRemoving(null);
                      }}
                      onNo={() => setRemoving(null)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {restoreLink}
      <div className="row-actions quiz-bar">
        <Button disabled={!loaded.length} onClick={() => setMode('quiz')}>
          {t('quickQuiz')}
        </Button>
        <span className="hint">
          {loaded.length ? t('usesVerbs', { count: loaded.length }) : t('openVerbFirst')}
        </span>
      </div>

      {!currentVerb && <p className="empty">{t('pickVerb')}</p>}
      {request?.state === 'loading' && (
        <WaitingFact>
          {rich(
            'conjugating',
            { i: (chunk) => <i lang={language}>{chunk}</i> },
            { verb: currentReference?.inf ?? '' }
          )}
        </WaitingFact>
      )}
      {request?.state === 'unavailable' && (
        <p className="note err" role="alert">
          {commonText.t('needsClaude')}
        </p>
      )}
      {request?.state === 'error' && (
        <div className="note err" role="alert">
          <p>
            {request.error instanceof ApiError ? request.error.message : commonText.t('unreadable')}
          </p>
          <Button
            onClick={() => {
              if (currentReference) void loadTable(currentReference, request.fresh);
            }}
          >
            {commonText.t('tryAgain')}
          </Button>
        </div>
      )}

      {shownConjugation && (
        <>
          <div className="conj-head">
            <h2 lang={language}>{shownConjugation.inf}</h2>
            <span className="ru" data-no-word-actions lang={translationOf(language)}>
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
                <Button
                  variant="ghost"
                  className="inline"
                  data-tooltip={t('conjugateAgainTitle')}
                  onClick={() => {
                    if (currentReference) void loadTable(currentReference, true);
                  }}
                >
                  {t('conjugateAgain')}
                </Button>
              </>
            )}
          </p>
          <div className="tense-tabs" role="group" aria-label={t('tense')}>
            {tenses.map((tenseOption) => (
              <Button
                variant="unstyled"
                key={tenseOption}
                aria-pressed={shownTense === tenseOption}
                disabled={!(shownConjugation.tenses[tenseOption] || []).length}
                onClick={() => setTense(tenseOption)}
              >
                {tenseOption}
              </Button>
            ))}
          </div>
          {canNegate && (
            <div className="tense-tabs" role="group" aria-label={t('sentenceType')}>
              <Button
                variant="unstyled"
                aria-pressed={!isNegative}
                onClick={() => setIsNegative(false)}
              >
                {t('affirmative')}
              </Button>
              <Button
                variant="unstyled"
                aria-pressed={isNegative}
                onClick={() => setIsNegative(true)}
              >
                {commonText.t('negative')}
              </Button>
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
              <ConjugationTable rows={rows} language={language} />
              <div className="row-actions">
                <Button variant="primary" onClick={() => setMode('drill')}>
                  {t('practiseTense')}
                </Button>
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
                    autoCorrect="off"
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
            <Button
              variant="primary"
              onClick={() => {
                setValues(rows.map(() => ''));
                setChecked(false);
                setRound((previous) => previous + 1);
              }}
            >
              {commonText.t('tryAgain')}
            </Button>
          </>
        ) : (
          <Button type="submit" variant="primary">
            {t('checkAnswers')}
          </Button>
        )}
        <Button variant="ghost" onClick={onStop}>
          {t('showTable')}
        </Button>
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
          <Button
            variant="primary"
            onClick={() => {
              setQuestions(makeQuiz(conjugations));
              setIndex(0);
              setScore(0);
              setTyped('');
              setResult(null);
            }}
          >
            {t('newQuiz')}
          </Button>
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
          autoCorrect="off"
          spellCheck={false}
          aria-label={commonText.t('yourAnswer')}
        />
        <Button variant="primary" type="submit">
          {result ? commonText.t('next') : commonText.t('check')}
        </Button>
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
