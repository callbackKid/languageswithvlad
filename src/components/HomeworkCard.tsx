import { useEffect, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { homework as homeworkText } from '../i18n/messages/homework';
import {
  type Bank,
  fetchConjugation,
  lessonWords,
  readAnalysis,
  readConjugation,
  usePreparedLesson,
} from '../lib/bank';
import { type Homework, type HomeworkItem, homeworkKey, writingKey } from '../lib/homework';
import { parseNextLesson } from '../lib/nextLesson';
import { getProgress } from '../lib/progress';
import { buildQuiz, pickWords, verbForms } from '../lib/quiz';
import { followLink, hrefFor } from '../lib/router';
import { lessonPath } from '../lib/sections';
import { load, save } from '../lib/storage';
import {
  type Conjugation,
  isVerbLanguage,
  languageOfTense,
  type Lesson,
  type VerbLanguage,
} from '../lib/types';
import { shuffle } from '../lib/util';
import GapFill from './GapFill';
import SendToTeacher from './SendToTeacher';
import WaitingFact from './WaitingFact';
import WordQuiz from './WordQuiz';
import WritingTask from './WritingTask';

const ROUND = 10;
const VERB_FORMS = 12;

/** "Next lesson in 2 days", read from the document's "le cours prochain:" line. */
function DueLine({ docText }: { docText: string }) {
  const { t } = useTranslation(homeworkText);
  const next = parseNextLesson(docText);
  if (!next || next === 'unconfirmed' || next.state !== 'upcoming') return null;
  const now = new Date();
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOfDay(next.start) - startOfDay(now)) / 86400000);
  return (
    <span className="homework-due">
      {days <= 0 ? t('dueToday') : days === 1 ? t('dueTomorrow') : t('dueIn', { count: days })}
    </span>
  );
}

/** A round on one lesson's words: a quiz, or gap sentences. The lesson is prepared first if this
    device doesn't have it yet. */
function WordsExercise({
  lesson,
  gaps,
  bank,
  ai,
  onClose,
  onDone,
}: {
  lesson: Lesson;
  gaps: boolean;
  bank: Bank;
  ai: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation(homeworkText);
  const preparing = usePreparedLesson(lesson, bank, ai);
  const [round, setRound] = useState(0);
  const words = lessonWords(lesson, bank, ai);
  const title = gaps ? t('gapsTitle', { n: lesson.n }) : t('wordsTitle', { n: lesson.n });
  if (preparing)
    return (
      <WaitingFact language={words[0]?.language}>{t('preparing', { n: lesson.n })}</WaitingFact>
    );
  if (gaps && words.length)
    return (
      <GapFill
        key={round}
        words={words}
        onClose={onClose}
        onRestart={() => setRound((previous) => previous + 1)}
        onRoundEnd={onDone}
      />
    );
  return (
    <WordQuiz
      title={title}
      closeLabel={t('backToHomework')}
      onClose={onClose}
      empty={t('noWords', { n: lesson.n })}
      onRoundEnd={onDone}
      // wrong answers come from every lesson, so a short lesson still gets four choices
      make={() =>
        buildQuiz(
          pickWords(words, getProgress(), ROUND),
          bank.words.length >= 4 ? bank.words : words
        )
      }
    />
  );
}

/** "verbes être, avoir — présent": forms of those verbs in that tense (in every tense when none
    is named). Tables the device doesn't have are asked from Claude. */
function VerbsExercise({
  item,
  language,
  ai,
  onClose,
  onDone,
}: {
  item: HomeworkItem;
  language: VerbLanguage;
  ai: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation(homeworkText);
  const verbs = item.verbs ?? [];
  const tense = item.tense && languageOfTense(item.tense) === language ? item.tense : undefined;
  const [tables, setTables] = useState<Conjugation[] | null>(null);
  const [failed, setFailed] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    void Promise.all(
      verbs.map(async (verb) => {
        // without Claude only a saved table can be used
        if (!ai) return readConjugation(verb, language) ?? verb;
        try {
          return await fetchConjugation({ inf: verb, ru: '', language });
        } catch {
          return verb;
        }
      })
    ).then((results) => {
      if (!alive) return;
      setTables(results.filter((result): result is Conjugation => typeof result !== 'string'));
      setFailed(results.filter((result): result is string => typeof result === 'string'));
    });
    return () => {
      alive = false;
    };
    // the item's verbs don't change while it is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tables) return <WaitingFact language={language}>{t('loadingVerbs')}</WaitingFact>;

  return (
    <>
      {failed.length > 0 && (
        <p className="field-error" role="alert">
          {t('verbsFailed', { verbs: failed.join(', ') })}
        </p>
      )}
      <WordQuiz
        title={t('verbsTitle', { verbs: verbs.join(', ') })}
        closeLabel={t('backToHomework')}
        onClose={onClose}
        onRoundEnd={onDone}
        make={() =>
          buildQuiz(
            [],
            [],
            shuffle(
              tables
                .flatMap(verbForms)
                // the task's tense when it is one of this language's, every tense otherwise
                .filter((form) => !form.negative && (!tense || form.t === tense))
            ).slice(0, VERB_FORMS)
          )
        }
      />
    </>
  );
}

/** The homework the teacher wrote in the newest lesson, as a checklist on Home. Each task opens
    its exercise when the app has one; finishing it ticks the task. */
export default function HomeworkCard({
  homework,
  lessons,
  bank,
  ai,
  docId,
  docText,
  canWrite,
}: {
  homework: Homework;
  lessons: Lesson[];
  bank: Bank;
  ai: boolean;
  docId: string;
  docText: string;
  /** whether the server can write to the document, for the report */
  canWrite: boolean;
}) {
  const { t } = useTranslation(homeworkText);
  const storageKey = homeworkKey(docId, homework.lesson.key);
  const [done, setDone] = useState<string[]>(() => load<string[]>(storageKey) ?? []);
  const [open, setOpen] = useState<HomeworkItem | null>(null);
  // another lesson's homework (after a sync) starts from its own ticks
  useEffect(() => {
    setDone(load<string[]>(storageKey) ?? []);
    setOpen(null);
  }, [storageKey]);

  const mark = (task: string, value: boolean) =>
    setDone((previous) => {
      if (previous.includes(task) === value) return previous;
      const next = value ? [...previous, task] : previous.filter((item) => item !== task);
      save(storageKey, next);
      return next;
    });
  // "mots de la leçon 5": the newest lesson with that number; otherwise the homework's own
  const lessonOf = (item: HomeworkItem) =>
    (item.lessonNumber !== undefined &&
      [...lessons].reverse().find((candidate) => candidate.n === item.lessonNumber)) ||
    homework.lesson;
  // verb tables exist for French and German; a verbs task in another language just opens the lesson
  const lessonLanguage = readAnalysis(homework.lesson.hash)?.language ?? 'fr';
  const verbLanguage = isVerbLanguage(lessonLanguage) ? lessonLanguage : null;
  const action = (item: HomeworkItem): string | null => {
    if (item.kind === 'words') return t('practiseWords');
    if (item.kind === 'writing') return t('write');
    if (item.kind === 'gaps' && ai) return t('fillGaps');
    if (item.kind === 'verbs' && verbLanguage) return t('conjugate');
    return null;
  };

  if (open) {
    const close = () => setOpen(null);
    const finished = () => mark(open.text, true);
    return (
      <section className="homework-card exercise">
        {open.kind === 'writing' ? (
          <WritingTask
            task={open.text}
            language={lessonLanguage}
            storageKey={writingKey(docId, homework.lesson.key, open.text)}
            ai={ai}
            onClose={close}
            onChecked={finished}
          />
        ) : open.kind === 'verbs' && verbLanguage ? (
          <VerbsExercise
            item={open}
            // the lesson's language: a tense name alone can mislead ("condicional" is Spanish
            // and Portuguese)
            language={verbLanguage}
            ai={ai}
            onClose={close}
            onDone={finished}
          />
        ) : (
          <WordsExercise
            lesson={lessonOf(open)}
            gaps={open.kind === 'gaps'}
            bank={bank}
            ai={ai}
            onClose={close}
            onDone={finished}
          />
        )}
      </section>
    );
  }

  const doneCount = homework.items.filter((item) => done.includes(item.text)).length;
  const path = lessonPath(homework.lesson.key);
  return (
    <section className="homework-card">
      <div className="homework-head">
        <h2>{t('title', { n: homework.lesson.n })}</h2>
        <DueLine docText={docText} />
        <span className="homework-progress">
          {t('progress', { done: doneCount, total: homework.items.length })}
        </span>
      </div>
      <p className="hint">{t('hint')}</p>
      <ul className="homework home-homework">
        {homework.items.map((item) => {
          const label = action(item);
          return (
            <li key={item.text} className={done.includes(item.text) ? 'done' : undefined}>
              <label>
                <input
                  type="checkbox"
                  checked={done.includes(item.text)}
                  onChange={(event) => mark(item.text, event.target.checked)}
                />
                <span lang={lessonLanguage}>{item.text}</span>
              </label>
              {label ? (
                <button type="button" className="btn" onClick={() => setOpen(item)}>
                  {label}
                </button>
              ) : (
                <a
                  className="open-link"
                  href={hrefFor(path)}
                  onClick={(event) => followLink(event, path)}
                >
                  {t('openLesson')} →
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <SendToTeacher lessons={lessons} docId={docId} canWrite={canWrite} />
    </section>
  );
}
