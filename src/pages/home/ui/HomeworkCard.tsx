import { useEffect, useState } from 'react';

import {
  type Homework,
  type HomeworkItem,
  homeworkKey,
  isTaskDone,
  loadDone,
  sameTask,
  saveDone,
  useHomeworkDone,
  writingKey,
} from '@/entities/homework';
import {
  type Bank,
  buildQuiz,
  fetchConjugation,
  type Lesson,
  lessonWords,
  parseNextLesson,
  pickWords,
  readConjugation,
  readLessonLanguage,
  usePreparedLesson,
  verbForms,
} from '@/entities/lesson';
import { type Conjugation } from '@/entities/verb';
import { getProgress } from '@/entities/word';
import { GapFill } from '@/features/gap-fill';
import { WordQuiz } from '@/features/quiz';
import { SendToTeacher } from '@/features/send-to-teacher';
import { WritingTask } from '@/features/writing-task';
import { isVerbLanguage, languageOfTense, lessonPath, type VerbLanguage } from '@/shared/config';
import { homework as homeworkText, useTranslation } from '@/shared/i18n';
import { daysBetween } from '@/shared/lib/dates';
import { followLink, hrefFor } from '@/shared/lib/router';
import { shuffle } from '@/shared/lib/util';
import WaitingFact from '@/shared/ui/WaitingFact';

const ROUND = 10;
const VERB_FORMS = 12;

// "Next lesson in 2 days", read from the document's "le cours prochain:" line.
function DueLine({ docText }: { docText: string }) {
  const { t } = useTranslation(homeworkText);
  const next = parseNextLesson(docText);
  if (!next || next === 'unconfirmed' || next.state !== 'upcoming') return null;
  const days = daysBetween(new Date(), next.start);
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
  hasClaude,
  onClose,
  onDone,
}: {
  lesson: Lesson;
  gaps: boolean;
  bank: Bank;
  hasClaude: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation(homeworkText);
  const preparing = usePreparedLesson(lesson, bank, hasClaude);
  const [round, setRound] = useState(0);
  const words = lessonWords(lesson, bank, hasClaude);
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
  hasClaude,
  onClose,
  onDone,
}: {
  item: HomeworkItem;
  language: VerbLanguage;
  hasClaude: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation(homeworkText);
  const verbs = item.verbs ?? [];
  // "presente" names a tense in three languages: only the lesson's counts
  const tenses = (item.tenses ?? []).filter((name) => languageOfTense(name) === language);
  const [tables, setTables] = useState<Conjugation[] | null>(null);
  const [failed, setFailed] = useState<string[]>([]);

  // one text, so the effect sees the same verbs as the same value on every render
  const verbList = verbs.join('\n');
  useEffect(() => {
    let alive = true;
    void Promise.all(
      verbList.split('\n').map(async (verb) => {
        // without Claude only a saved table can be used
        if (!hasClaude) return readConjugation(verb, language) ?? verb;
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
  }, [verbList, hasClaude, language]);

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
                // the task's tenses when it names this language's, every tense otherwise
                .filter((form) => !form.negative && (!tenses.length || tenses.includes(form.t)))
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
  hasClaude,
  docId,
  docText,
  canWrite,
}: {
  homework: Homework;
  lessons: Lesson[];
  bank: Bank;
  hasClaude: boolean;
  docId: string;
  docText: string;
  // whether the server can write to the document, for the report
  canWrite: boolean;
}) {
  const { t } = useTranslation(homeworkText);
  const storageKey = homeworkKey(docId, homework.lesson.key);
  // read on every render: the store re-renders this card whenever ticks are saved anywhere
  useHomeworkDone();
  const done = loadDone(storageKey);
  const [open, setOpen] = useState<HomeworkItem | null>(null);
  // another lesson's homework (after a sync) closes the open exercise
  useEffect(() => {
    setOpen(null);
  }, [storageKey]);

  // read from the device, not from state: an exercise that finishes calls this from an older render
  const mark = (task: string, value: boolean) => {
    const saved = loadDone(storageKey);
    if (isTaskDone(saved, task) === value) return;
    saveDone(storageKey, value ? [...saved, task] : saved.filter((item) => !sameTask(item, task)));
  };
  // "mots de la leçon 5": the newest lesson with that number; otherwise the homework's own
  const lessonOf = (item: HomeworkItem) =>
    (item.lessonNumber !== undefined &&
      [...lessons].reverse().find((candidate) => candidate.n === item.lessonNumber)) ||
    homework.lesson;
  // a verbs task conjugates in a language with verb tables (all but English); otherwise it opens the lesson
  const lessonLanguage = readLessonLanguage(homework.lesson.hash) ?? 'fr';
  const verbLanguage = isVerbLanguage(lessonLanguage) ? lessonLanguage : null;
  const action = (item: HomeworkItem): string | null => {
    if (item.kind === 'words') return t('practiseWords');
    if (item.kind === 'writing') return t('write');
    if (item.kind === 'gaps' && hasClaude) return t('fillGaps');
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
            hasClaude={hasClaude}
            onClose={close}
            onChecked={finished}
          />
        ) : open.kind === 'verbs' && verbLanguage ? (
          <VerbsExercise
            item={open}
            // the lesson's language: a tense name alone can mislead ("condicional" is Spanish
            // and Portuguese)
            language={verbLanguage}
            hasClaude={hasClaude}
            onClose={close}
            onDone={finished}
          />
        ) : (
          <WordsExercise
            lesson={lessonOf(open)}
            gaps={open.kind === 'gaps'}
            bank={bank}
            hasClaude={hasClaude}
            onClose={close}
            onDone={finished}
          />
        )}
      </section>
    );
  }

  const doneCount = homework.items.filter((item) => isTaskDone(done, item.text)).length;
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
            <li key={item.text} className={isTaskDone(done, item.text) ? 'done' : undefined}>
              <label>
                <input
                  type="checkbox"
                  checked={isTaskDone(done, item.text)}
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
