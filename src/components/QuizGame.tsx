import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/shared/i18n/core';
import { game } from '@/shared/i18n/messages/game';
import { asFields, asList, load, save } from '@/shared/lib/storage';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import Speak from '@/shared/ui/Speak';

import { type Bank, lessonWords } from '../lib/bank';
import { recordWord } from '../lib/progress';
import { buildChoiceQuiz, type QuizItem } from '../lib/quiz';
import type { Lesson, Word } from '../lib/types';

// Questions in a round, and seconds for each.
export const GAME_QUESTIONS = 10;
export const GAME_SECONDS = 15;
// a right answer is worth this much, plus a bonus for every second left
const BASE_POINTS = 100;
const POINTS_PER_SECOND = 10;
const KEPT_RECORDS = 10;
const SHOWN_RECORDS = 5;
// milliseconds between two updates of the clock: smooth enough for the bar
const CLOCK_TICK = 100;

export interface GameRecord {
  points: number;
  correct: number;
  total: number;
  at: number;
  lessonKey: string;
}
const recordsKey = (docId: string) => `game-records:${docId}`;
// The records table of a document, each record checked.
export const readRecords = (docId: string): GameRecord[] =>
  asList(load<unknown>(recordsKey(docId)), (raw) =>
    asFields(raw, {
      points: 'number',
      correct: 'number',
      total: 'number',
      at: 'number',
      lessonKey: 'string',
    })
  );

/** The words a round is played on: the newest lesson's, with the one before it when the newest
    has too few to tell apart (a lesson that has only just started). */
export function gameWords(lessons: Lesson[], bank: Bank, hasClaude: boolean): Word[] {
  const newest = lessons[lessons.length - 1];
  if (!newest) return [];
  const words = lessonWords(newest, bank, hasClaude).filter((word) => word.ru);
  const before = lessons[lessons.length - 2];
  if (words.length >= GAME_QUESTIONS || !before) return words;
  const seen = new Set(words.map((word) => word.fr.toLowerCase()));
  return [
    ...words,
    ...lessonWords(before, bank, hasClaude).filter(
      (word) => word.ru && !seen.has(word.fr.toLowerCase())
    ),
  ];
}

// The best rounds on this device, best first.
export function RecordsTable({
  records,
  highlight,
}: {
  records: GameRecord[];
  highlight?: number;
}) {
  const { t, locale } = useTranslation(game);
  if (!records.length) return <p className="hint">{t('noRecords')}</p>;
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  return (
    <table className="game-records">
      <caption>{t('records')}</caption>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">{t('pointsHeader')}</th>
          <th scope="col">{t('rightHeader')}</th>
          <th scope="col">{t('whenHeader')}</th>
        </tr>
      </thead>
      <tbody>
        {records.slice(0, SHOWN_RECORDS).map((record, index) => (
          <tr key={record.at} className={record.at === highlight ? 'current' : undefined}>
            <td>{index + 1}</td>
            <td>{record.points}</td>
            <td>
              {record.correct}/{record.total}
            </td>
            <td>{date.format(record.at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type Answer = { picked: string | null; points: number };
type ChoiceItem = Extract<QuizItem, { kind: 'pick-ru' | 'pick-fr' }>;
const isChoice = (item: QuizItem | undefined): item is ChoiceItem =>
  item?.kind === 'pick-ru' || item?.kind === 'pick-fr';

/** A round against the clock: choice questions, points for a right answer and more for a fast
    one, and the records table at the end. Made for the shared screen during the lesson. */
export default function QuizGame({
  words,
  pool,
  lessonNumber,
  lessonKey,
  docId,
  onClose,
}: {
  words: Word[];
  // where wrong answers come from
  pool: Word[];
  lessonNumber: number;
  lessonKey: string;
  docId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(game);
  const make = () =>
    buildChoiceQuiz(words, pool.length >= 4 ? pool : words).slice(0, GAME_QUESTIONS);
  const [questions, setQuestions] = useState<QuizItem[]>(make);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [left, setLeft] = useState(GAME_SECONDS * 1000);
  const [finished, setFinished] = useState<GameRecord | null>(null);
  const [records, setRecords] = useState(() => readRecords(docId));
  const startedAt = useRef(Date.now());
  const nextButton = useRef<HTMLButtonElement>(null);

  const question = questions[index];
  const answer = answers[index];
  const choose = (picked: string | null) => {
    if (!isChoice(question) || answers[index]) return;
    const right = question.kind === 'pick-ru' ? question.word.ru : question.word.fr;
    const correct = picked === right;
    const secondsLeft = Math.ceil(left / 1000);
    const points = correct ? BASE_POINTS + secondsLeft * POINTS_PER_SECOND : 0;
    setAnswers((previous) => [...previous, { picked, points }]);
    recordWord(question.word, correct);
  };
  // the clock reads the newest choose when time is up, not the one of the render that started it
  const chooseNow = useRef(choose);
  useEffect(() => {
    chooseNow.current = choose;
  });

  // the clock runs until the question is answered; time's up counts as a wrong answer
  useEffect(() => {
    if (!question || answer) return;
    startedAt.current = Date.now();
    setLeft(GAME_SECONDS * 1000);
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, GAME_SECONDS * 1000 - (Date.now() - startedAt.current));
      setLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(timer);
        chooseNow.current(null);
      }
    }, CLOCK_TICK);
    return () => window.clearInterval(timer);
  }, [question, answer]);
  useEffect(() => {
    if (answer) nextButton.current?.focus();
  }, [answer]);

  const finish = () => {
    const record: GameRecord = {
      points: answers.reduce((sum, item) => sum + item.points, 0),
      correct: answers.filter((item) => item.points > 0).length,
      total: questions.length,
      at: Date.now(),
      lessonKey,
    };
    const next = [...readRecords(docId), record]
      .sort((first, second) => second.points - first.points)
      .slice(0, KEPT_RECORDS);
    save(recordsKey(docId), next);
    setRecords(next);
    setFinished(record);
  };
  const restart = () => {
    setQuestions(make());
    setIndex(0);
    setAnswers([]);
    setFinished(null);
  };
  const title = t('round', { n: lessonNumber });

  if (!questions.length)
    return (
      <div className="ex">
        <ExerciseHead title={title} onClose={onClose} closeLabel={t('backToLesson')} />
        <p className="empty">{t('notEnough')}</p>
      </div>
    );

  if (finished) {
    const best = records[0]?.at === finished.at && records.length > 1;
    return (
      <div className="ex quiz-game">
        <ExerciseHead title={title} onClose={onClose} closeLabel={t('backToLesson')} />
        <p className="game-score">{t('score', { points: finished.points })}</p>
        <p className="hint">{t('correct', { correct: finished.correct, total: finished.total })}</p>
        {best && <p className="game-record">{t('newRecord')}</p>}
        <RecordsTable records={records} highlight={finished.at} />
        <div className="row-actions">
          <button type="button" className="btn primary" autoFocus onClick={restart}>
            {t('playAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!isChoice(question)) return null;
  const language = question.word.language ?? 'fr';
  const right = question.kind === 'pick-ru' ? question.word.ru : question.word.fr;
  const total = answers.reduce((sum, item) => sum + item.points, 0);
  const share = left / (GAME_SECONDS * 1000);
  return (
    <div className="ex quiz-game">
      <ExerciseHead title={title} onClose={onClose} closeLabel={t('backToLesson')}>
        <span className="progress">
          {index + 1} / {questions.length} · {t('points', { count: total })}
        </span>
      </ExerciseHead>
      <div
        className={'game-clock' + (share < 0.3 ? ' low' : '')}
        role="timer"
        aria-label={t('secondsLeft', { seconds: Math.ceil(left / 1000) })}
      >
        <span style={{ width: `${(answer ? 0 : share) * 100}%` }} />
      </div>
      {question.kind === 'pick-ru' ? (
        <p className="quiz-word">
          <span lang={language}>{question.word.fr}</span>
          <Speak text={question.word.fr} language={language} />
        </p>
      ) : (
        <p className="quiz-word ru" lang="ru">
          {question.word.ru}
        </p>
      )}
      <div className="choices">
        {question.choices.map((choice) => {
          const state = !answer
            ? ''
            : choice === right
              ? ' ok'
              : choice === answer.picked
                ? ' bad'
                : '';
          return (
            <button
              type="button"
              key={choice}
              className={'choice' + state + (question.kind === 'pick-ru' ? ' ru' : '')}
              lang={question.kind === 'pick-ru' ? 'ru' : language}
              disabled={!!answer}
              onClick={() => choose(choice)}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {answer && (
        <>
          <p className={'feedback ' + (answer.points ? 'ok' : 'bad')}>
            {answer.points
              ? t('right', { points: answer.points })
              : answer.picked === null
                ? t('timeUp', { answer: right })
                : t('wrong', { answer: right })}
          </p>
          <div className="row-actions">
            <button
              type="button"
              ref={nextButton}
              className="btn primary"
              onClick={() => (index + 1 < questions.length ? setIndex(index + 1) : finish())}
            >
              {index + 1 < questions.length ? t('next') : t('finish')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
