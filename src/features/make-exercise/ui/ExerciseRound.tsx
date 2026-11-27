import { useState } from 'react';

import { common, useTranslation } from '@/shared/i18n';
import { type Grade, grade } from '@/shared/lib/grade';
import { shuffle } from '@/shared/lib/util';
import { Button, Input } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import Speak from '@/shared/ui/Speak';

import { makeExerciseText } from '../i18n/makeExercise';
import { type ExerciseQuestion, type MadeExercise } from '../model/types';

// How an answer compares with the right one and the others just as right: the best of them.
const gradeAnswer = (input: string, question: ExerciseQuestion): Grade => {
  const grades = [question.answer, ...question.accept].map((answer) => grade(input, answer));
  if (grades.includes('ok')) return 'ok';
  if (grades.includes('accent')) return 'accent';
  return grades[0] ?? 'bad';
};

/** One round of a made exercise: a question at a time, checked, explained, and a score at the
    end. onAnother (Create another) asks for a new round; without it, the round just closes. */
const ExerciseRound = ({
  exercise,
  onClose,
  onAnother,
  closeLabel,
}: {
  exercise: MadeExercise;
  onClose: () => void;
  onAnother?: () => void;
  // the way out's name: Close by default, Back to words when the round was opened from a word list
  closeLabel?: string;
}) => {
  const { t } = useTranslation(makeExerciseText);
  const commonText = useTranslation(common);
  const [questions, setQuestions] = useState(() => shuffle(exercise.questions));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<Grade | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  // the translation would give the answer away: folded until the student opens it or answers
  const [showRu, setShowRu] = useState(false);
  const [score, setScore] = useState(0);
  const { language } = exercise;
  const question = questions[index];

  const answer = (given: string) => {
    if (!question) return;
    // a picked option has no typo to forgive: [maʒe] for [mɑ̃ʒe] is wrong, not "mind the accents"
    const graded =
      question.type === 'choice'
        ? given === question.answer
          ? 'ok'
          : 'bad'
        : gradeAnswer(given, question);
    if (graded === 'empty') return;
    setResult(graded);
    setShowRu(true);
    if (graded !== 'bad') setScore((previous) => previous + 1);
  };
  // to the next question, or, from the start, a new order of the same questions
  const goTo = (position: number) => {
    setIndex(position);
    setTyped('');
    setPicked(null);
    setResult(null);
    setShowRu(false);
  };
  const next = () => goTo(index + 1);
  const again = () => {
    setQuestions(shuffle(exercise.questions));
    setScore(0);
    goTo(0);
  };

  const head = (
    <ExerciseHead
      title={exercise.title || t('title')}
      onClose={onClose}
      closeLabel={closeLabel ?? commonText.t('close')}
    />
  );
  if (!question)
    return (
      <div className="ex made-exercise">
        {head}
        <p className="score">{commonText.t('scoreLine', { score, total: questions.length })}</p>
        <div className="row-actions">
          <Button variant="primary" onClick={again}>
            {t('again')}
          </Button>
          <Button onClick={onAnother ?? onClose}>{t('makeAnother')}</Button>
        </div>
      </div>
    );

  const isTranslate = question.type === 'translate';
  return (
    <div className="ex made-exercise">
      {head}
      <p className="hint">{t('progress', { current: index + 1, total: questions.length })}</p>
      {isTranslate && <p className="hint">{t('translate')}</p>}
      <p
        className="made-exercise-prompt"
        lang={isTranslate ? exercise.translatedTo : (exercise.promptIn ?? language)}
      >
        {question.prompt}
        {question.say && (
          <>
            {' '}
            {/* a label without the word, which may be the answer */}
            <Speak text={question.say} language={language} label={commonText.t('listen')} />
          </>
        )}
      </p>
      {question.ru && (
        <details
          className="translation-peek"
          open={showRu}
          onToggle={(event) => setShowRu(event.currentTarget.open)}
        >
          <summary>{commonText.t('translation')}</summary>
          <p lang={exercise.translatedTo}>{question.ru}</p>
        </details>
      )}

      {question.type === 'choice' ? (
        <div className="choices">
          {question.options.map((option) => {
            const stateClass =
              picked === null
                ? ''
                : option === question.answer
                  ? ' ok'
                  : option === picked
                    ? ' bad'
                    : '';
            return (
              <Button
                variant="unstyled"
                key={option}
                className={'choice' + stateClass}
                lang={language}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(option);
                  answer(option);
                }}
              >
                {option}
              </Button>
            );
          })}
        </div>
      ) : (
        <form
          className="quiz-input"
          onSubmit={(event) => {
            event.preventDefault();
            if (result) next();
            else answer(typed);
          }}
        >
          <Input
            lang={language}
            value={typed}
            readOnly={!!result}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={commonText.t('yourAnswer')}
          />
          {!result && (
            <Button type="submit" variant="primary">
              {commonText.t('check')}
            </Button>
          )}
        </form>
      )}

      {result && (
        <div className={'feedback ' + (result === 'bad' ? 'bad' : 'ok')} role="status">
          <p>
            {result === 'ok'
              ? commonText.t('right')
              : commonText.rich(
                  result === 'accent' ? 'almostAccents' : 'answerIs',
                  { b: (chunk) => <b lang={language}>{chunk}</b> },
                  { answer: question.answer }
                )}
          </p>
          {question.explanation && <p lang={exercise.translatedTo}>{question.explanation}</p>}
          <Button variant="primary" onClick={next}>
            {index + 1 < questions.length ? commonText.t('next') : commonText.t('seeScore')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseRound;
