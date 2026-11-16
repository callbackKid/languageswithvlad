import { useState } from 'react';

import { getUiLanguage, useTranslation } from '../i18n/core';
import { paper } from '../i18n/messages/paper';
import { api } from '../lib/api';
import { getSettings } from '../lib/settings';
import { load, save } from '../lib/storage';
import type { GrammarRule, HomeworkTask, Language, LessonExtras } from '../lib/types';
import BookImport from './BookImport';
import { GapRound } from './GapFill';
import GrammarRuleBox from './GrammarRuleBox';

/* The lesson's Grammar, Homework and Book exercises tabs. What they show comes from one reading
   of the lesson by Claude (LessonView keeps it), explained in the interface language. */

/** The grammar points to revise, each with a round of practice sentences. */
export function GrammarTab({ extras }: { extras: LessonExtras }) {
  const { t } = useTranslation(paper);
  const [practising, setPractising] = useState<GrammarRule | null>(null);
  const [round, setRound] = useState(0);
  const language = extras.language;

  if (practising)
    return (
      <GapRound
        key={round}
        title={t('practiceTitle', { rule: practising.title })}
        language={language}
        waiting={t('writingPractice')}
        load={() =>
          api.grammarPractice({
            language,
            level: getSettings().levels[language],
            title: practising.title,
            summary: practising.summary,
            explainIn: getUiLanguage(),
          })
        }
        onClose={() => setPractising(null)}
        onRestart={() => setRound((previous) => previous + 1)}
      />
    );
  if (!extras.grammar.length) return <p className="empty">{t('noGrammar')}</p>;
  return (
    <div className="grammar-rules">
      {extras.grammar.map((rule, index) => (
        <GrammarRuleBox
          key={rule.title}
          rule={rule}
          language={language}
          label={<span lang={language}>{rule.title}</span>}
          open={index === 0}
        >
          <div className="row-actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setPractising(rule);
                setRound((previous) => previous + 1);
              }}
            >
              {t('practiseRule')}
            </button>
          </div>
        </GrammarRuleBox>
      ))}
    </div>
  );
}

/** The homework, ticked off on this device. */
export function HomeworkTab({
  tasks,
  storageKey,
  language,
}: {
  tasks: HomeworkTask[];
  storageKey: string;
  language: Language;
}) {
  const { t } = useTranslation(paper);
  // the tasks done, by their text, so a task stays ticked when the lesson is edited around it
  const [done, setDone] = useState<string[]>(() => load<string[]>(storageKey) ?? []);
  if (!tasks.length) return <p className="empty">{t('noHomework')}</p>;
  const toggle = (task: string) => {
    const next = done.includes(task) ? done.filter((item) => item !== task) : [...done, task];
    setDone(next);
    save(storageKey, next);
  };
  const doneCount = tasks.filter((task) => done.includes(task.task)).length;
  return (
    <>
      <p className="hint">
        {t('homeworkHint')} {t('homeworkProgress', { done: doneCount, total: tasks.length })}
      </p>
      <ul className="homework">
        {tasks.map((task) => (
          <li key={task.task} className={done.includes(task.task) ? 'done' : undefined}>
            <label>
              <input
                type="checkbox"
                checked={done.includes(task.task)}
                onChange={() => toggle(task.task)}
              />
              <span>
                <span lang={language}>{task.task}</span>
                {task.meaning && <span className="meaning">{task.meaning}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

/** The exercises from the student's book that are in the lesson, and a way to add more. */
export function BookTab({
  extras,
  docId,
  lessonKey,
  docWriter,
  ai,
}: {
  extras: LessonExtras | null;
  docId: string;
  lessonKey: string;
  /** whether the server can write to this document; undefined: the lesson isn't in it */
  docWriter: boolean | undefined;
  ai: boolean;
}) {
  const { t } = useTranslation(paper);
  const exercises = extras?.book ?? [];
  return (
    <>
      {extras &&
        (exercises.length ? (
          <ol className="book-exercises">
            {exercises.map((exercise, index) => (
              <li key={`${exercise.title}-${index}`} className="book-exercise">
                <h3 lang={extras.language}>
                  {exercise.title}
                  {exercise.title && exercise.instructions && ' — '}
                  {exercise.instructions}
                </h3>
                {exercise.items.length > 0 && (
                  <ol lang={extras.language}>
                    {exercise.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty">{t('noBook')}</p>
        ))}
      {ai && docWriter !== undefined && (
        <BookImport docId={docId} lessonKey={lessonKey} docWriter={docWriter} />
      )}
    </>
  );
}
