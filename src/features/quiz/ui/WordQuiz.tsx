import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';

import { dictationForm, type QuizItem } from '@/entities/lesson';
import { recordForm, recordWord, Transcription } from '@/entities/word';
import { type Language, languageOfTense, useTranslationLanguage } from '@/shared/config';
import { common, exercises, learning, useTranslation } from '@/shared/i18n';
import { grade } from '@/shared/lib/grade';
import { speak } from '@/shared/lib/speech';
import { Button } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import Speak from '@/shared/ui/Speak';

type Result = 'ok' | 'bad' | 'accent' | 'article';
// a noun typed without its article is a near miss, not a mistake
// (a whole word followed by a space, or an elided one like l' that runs into the noun)
const ARTICLE =
  /^(?:(?:le|la|les|un|une|des|der|die|das|ein|eine|el|los|las|una|o|a|os|as|um|uma|il|lo|i|gli|uno)\s+|(?:l|un)['’]\s*)/i;

const gradeWord = (typed: string, answer: string): Result | null => {
  const result = grade(typed, answer);
  if (result === 'empty') return null;
  if (result !== 'bad') return result;
  const bare = answer.replace(ARTICLE, '');
  return bare !== answer && grade(typed, bare) !== 'bad' ? 'article' : 'bad';
};

// An answer the student got wrong, for the list at the end of a round.
interface Missed {
  asked: string;
  answer: string;
  language: Language;
}

/** A run of mixed questions; make() builds the next round. With review, the end of a round
    lists what the student got wrong (the warm-up, for the teacher to go over). */
const WordQuiz = ({
  title,
  make,
  onClose,
  closeLabel,
  empty,
  review,
  onRoundEnd,
  onNextRound,
  speakAtOnce = true,
}: {
  title: string;
  make: () => QuizItem[];
  onClose?: () => void;
  closeLabel?: string;
  empty?: string;
  review?: { title: string; none: string };
  // called once each time a round is over (homework ticks itself)
  onRoundEnd?: () => void;
  // instead of make() again: a round Claude writes (the blitz) starts over by asking for a new one
  onNextRound?: () => void;
  /** false for a quiz that is simply on the page (Home): its first listening question waits for
      the student instead of speaking as soon as the page opens */
  speakAtOnce?: boolean;
}) => {
  const { t: tx } = useTranslation(exercises);
  const { t, rich } = useTranslation(common);
  const names = useTranslation(learning);
  const translationOf = useTranslationLanguage();
  const [questions, setQuestions] = useState(make);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Missed[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, [index]);
  useEffect(() => {
    if (result) nextButton.current?.focus();
  }, [result]);
  // dictation reads each word as it appears
  const current = questions[index];
  const over = questions.length > 0 && !current;
  const latestRoundEnd = useRef(onRoundEnd);
  useEffect(() => {
    latestRoundEnd.current = onRoundEnd;
  }, [onRoundEnd]);
  useEffect(() => {
    if (over) latestRoundEnd.current?.();
  }, [over]);
  // turned on by the student's own steps (Next, a new round, Listen), never by the quiz appearing
  const [autoSpeak, setAutoSpeak] = useState(speakAtOnce);
  useEffect(() => {
    if (current?.kind === 'listen' && autoSpeak)
      speak(current.word.fr, current.word.language ?? 'fr');
  }, [current, autoSpeak]);

  const restart = () => {
    setAutoSpeak(true);
    setQuestions(make());
    setIndex(0);
    setScore(0);
    setMissed([]);
    setTyped('');
    setPicked(null);
    setResult(null);
  };
  const next = () => {
    setAutoSpeak(true);
    setIndex((previous) => previous + 1);
    setTyped('');
    setPicked(null);
    setResult(null);
  };
  // the student can't listen now (no headphones, a quiet room): this and the round's other
  // listening questions go, uncounted, and the next question takes this one's place
  const skipListening = () => {
    setQuestions((previous) =>
      previous.filter((item, position) => position < index || item.kind !== 'listen')
    );
    setTyped('');
  };
  const head = (
    <ExerciseHead title={title} onClose={onClose} closeLabel={closeLabel}>
      {questions.length > 0 && (
        <span className="progress">
          {Math.min(index + 1, questions.length)} / {questions.length}
        </span>
      )}
    </ExerciseHead>
  );
  const shell = (body: ReactNode) => (
    <div className="ex">
      {head}
      {body}
    </div>
  );

  if (!questions.length) return shell(<p className="empty">{empty || tx('nothingToPractise')}</p>);
  // past the last question: the round is over
  if (!current)
    return shell(
      <>
        <p className="score">{t('scoreLine', { score, total: questions.length })}</p>
        {review &&
          (missed.length ? (
            <section className="quiz-missed">
              <h3>{review.title}</h3>
              <ul>
                {missed.map((item) => (
                  <li key={item.asked + item.answer}>
                    <span className="fr" lang={item.language}>
                      {item.answer}
                    </span>
                    <span className="ru">{item.asked}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="hint">{review.none}</p>
          ))}
        <div className="row-actions">
          <Button variant="primary" autoFocus onClick={onNextRound ?? restart}>
            {tx('nextRound')}
          </Button>
        </div>
      </>
    );

  const question = current;
  const finish = (outcome: Result) => {
    setResult(outcome);
    if (outcome === 'ok') setScore((previous) => previous + 1);
    if (outcome === 'bad')
      setMissed((previous) => [
        ...previous,
        question.kind === 'form'
          ? {
              asked: `${question.form.inf}, ${question.form.t}${question.form.negative ? `, ${t('negative')}` : ''}`,
              answer: `${question.form.p} ${question.form.f}`,
              language: languageOfTense(question.form.t),
            }
          : {
              asked: question.word.ru,
              answer: question.word.fr,
              language: question.word.language ?? 'fr',
            },
      ]);
    // near misses show the right form without counting against the student
    if (outcome === 'ok' || outcome === 'bad') {
      if (question.kind === 'form')
        recordForm(
          question.form.inf,
          question.form.t,
          question.form.p,
          question.form.f,
          outcome === 'ok',
          question.form.negative
        );
      else recordWord(question.word, outcome === 'ok');
    }
  };
  // a verb form's tense names its language; words carry the language of their lesson
  const language =
    question.kind === 'form' ? languageOfTense(question.form.t) : (question.word.language ?? 'fr');
  // a dictated adjective whose forms sound alike says which form to write
  const form =
    question.kind === 'listen'
      ? dictationForm(question.word, translationOf(question.word.language))
      : null;
  const answer =
    question.kind === 'form'
      ? `${question.form.p} ${question.form.f}`
      : question.kind === 'pick-ru'
        ? question.word.ru
        : question.kind === 'gap'
          ? question.answer
          : question.word.fr;
  const listen = question.kind !== 'pick-ru' && (
    <>
      {' '}
      <Speak text={answer} language={language} />
    </>
  );
  const feedback = result && (
    <>
      {result === 'ok' && (
        <p className="feedback ok">
          {t('right')}
          {question.kind === 'listen' && (
            <>
              {' '}
              <b lang={language}>{answer}</b>
            </>
          )}
          {listen}
        </p>
      )}
      {result === 'accent' && (
        <p className="feedback warn">
          {rich('almostAccents', { b: (chunk) => <b lang={language}>{chunk}</b> }, { answer })}
          {listen}
        </p>
      )}
      {result === 'article' && (
        <p className="feedback warn">
          {rich('almostArticle', { b: (chunk) => <b lang={language}>{chunk}</b> }, { answer })}
          {listen}
        </p>
      )}
      {result === 'bad' && (
        <p className="feedback bad">
          {rich(
            'answerIs',
            {
              b: (chunk) => (
                <b
                  lang={
                    question.kind === 'pick-ru' ? translationOf(question.word.language) : language
                  }
                >
                  {chunk}
                </b>
              ),
            },
            { answer }
          )}
          {/* a gap's answer is a form of the word, which the word's transcription doesn't match */}
          {question.kind !== 'form' &&
            question.kind !== 'pick-ru' &&
            question.kind !== 'gap' &&
            question.word.tr && (
              <>
                {' '}
                <Transcription tr={question.word.tr} />
              </>
            )}
          {listen}
        </p>
      )}
      {(question.kind === 'listen' || question.kind === 'define' || question.kind === 'gap') && (
        <p className="ru-line" lang={translationOf(question.word.language)}>
          {question.kind === 'gap' ? question.ru : question.word.ru}
        </p>
      )}
      <div className="row-actions">
        <Button ref={nextButton} variant="primary" onClick={next}>
          {index + 1 < questions.length ? t('next') : t('seeScore')}
        </Button>
      </div>
    </>
  );

  if (question.kind === 'pick-ru' || question.kind === 'pick-fr' || question.kind === 'gap') {
    const right = answer;
    return shell(
      <>
        {question.kind === 'gap' ? (
          <p className="sentence" lang={language}>
            {question.before}{' '}
            <span className={'gap' + (result == null ? '' : result === 'ok' ? ' ok' : ' bad')}>
              {result == null ? '\u00a0' : question.answer}
            </span>{' '}
            {question.after}
          </p>
        ) : question.kind === 'pick-ru' ? (
          <p className="quiz-word">
            <span lang={language}>{question.word.fr}</span>
            {question.word.tr && <Transcription tr={question.word.tr} />}
            <Speak text={question.word.fr} language={language} />
          </p>
        ) : (
          <p className="quiz-word ru" lang={translationOf(question.word.language)}>
            {question.word.ru}
          </p>
        )}
        <p className="ru-line">
          {question.kind === 'pick-ru'
            ? tx('pickTranslation')
            : question.kind === 'gap'
              ? tx('pickForGap')
              : names.t(`pickWord.${language}`)}
        </p>
        <div className="choices">
          {question.choices.map((choice) => {
            const stateClass =
              picked == null ? '' : choice === right ? ' ok' : choice === picked ? ' bad' : '';
            return (
              <Button
                variant="unstyled"
                key={choice}
                className={'choice' + stateClass + (question.kind === 'pick-ru' ? ' ru' : '')}
                lang={
                  question.kind === 'pick-ru' ? translationOf(question.word.language) : language
                }
                disabled={picked != null}
                onClick={() => {
                  setPicked(choice);
                  finish(choice === right ? 'ok' : 'bad');
                }}
              >
                {choice}
              </Button>
            );
          })}
        </div>
        {feedback}
      </>
    );
  }

  const check = (event: FormEvent) => {
    event.preventDefault();
    if (result) return next();
    const grading =
      question.kind === 'form'
        ? grade(typed, question.form.f, question.form.p)
        : gradeWord(typed, question.word.fr);
    if (grading && grading !== 'empty') finish(grading);
  };
  return shell(
    <>
      {question.kind === 'form' ? (
        <p className="quiz-q">
          <b lang="fr">{question.form.inf}</b>, {question.form.t}
          {question.form.negative && `, ${t('negative')}`}
        </p>
      ) : question.kind === 'listen' ? (
        <>
          <p className="quiz-word">
            {/* nothing has played yet only on Home's quiz, before the student's first step:
                the first press turns speaking on, which plays the word */}
            <Button
              className="big"
              onClick={() => (autoSpeak ? speak(question.word.fr, language) : setAutoSpeak(true))}
            >
              {autoSpeak ? tx('listenAgain') : tx('listenFirst')}
            </Button>
          </p>
          <p className="ru-line">
            {form ? tx(`writeWhatYouHearForm.${form}`) : tx('writeWhatYouHear')}
          </p>
        </>
      ) : question.kind === 'define' ? (
        <>
          <p className="quiz-definition" lang={language}>
            {question.definition}
          </p>
          <p className="ru-line">{tx('guessFromDefinition')}</p>
        </>
      ) : (
        <>
          <p className="quiz-word ru" lang={translationOf(question.word.language)}>
            {question.word.ru}
          </p>
          <p className="ru-line">{names.t(`typeIn.${language}`)}</p>
        </>
      )}
      <form className="quiz-input" onSubmit={check}>
        {question.kind === 'form' && (
          <span className="p" lang="fr">
            {question.form.p}
          </span>
        )}
        <input
          ref={input}
          lang={language}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          readOnly={!!result}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t('yourAnswer')}
        />
        {!result && (
          <Button variant="primary" type="submit">
            {t('check')}
          </Button>
        )}
      </form>
      {/* only in a mixed round: a dictation round would be left empty, and it can be closed */}
      {question.kind === 'listen' &&
        !result &&
        questions.some((item) => item.kind !== 'listen') && (
          <div className="row-actions">
            <Button variant="ghost" onClick={skipListening}>
              {tx('cantListen')}
            </Button>
          </div>
        )}
      {feedback}
    </>
  );
};

export default WordQuiz;
