import { useMemo, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { app } from '../i18n/messages/app';
import { pages } from '../i18n/messages/pages';
import type { Bank } from '../lib/bank';
import type { Analysis } from '../lib/types';
import PageHead, { BankNote } from './PageHead';
import VerbsTab from './VerbsTab';
import WordsTab from './WordsTab';

/** Every exercise, run on the words and verbs of all lessons or the ones picked. */
export default function Practice({ bank, ai }: { bank: Bank; ai: boolean }) {
  const { t } = useTranslation(pages);
  const appText = useTranslation(app);
  // null means every lesson, including ones still being prepared
  const [selectedLessons, setSelectedLessons] = useState<Set<string> | null>(null);
  const [tab, setTab] = useState<'words' | 'verbs'>('words');

  const analysis = useMemo((): Analysis => {
    const isIncluded = (key: string | undefined) =>
      !selectedLessons || (!!key && selectedLessons.has(key));
    const words = bank.words.filter((word) => isIncluded(word.lesson));
    const chosenWords = new Set(words.map((word) => word.fr));
    return {
      // lessons can mix languages; each word also carries its own
      language: words[0]?.language ?? 'fr',
      topic: '',
      words,
      local: !ai,
      pairs: bank.pairs.filter(
        (pair) => isIncluded(pair.lesson) && chosenWords.has(pair.a) && chosenWords.has(pair.b)
      ),
      verbs: bank.verbs.filter((verb) => isIncluded(verb.lesson)),
    };
  }, [bank.words, bank.pairs, bank.verbs, selectedLessons, ai]);
  const { words } = analysis;
  const ready = bank.lessons.filter((lesson) => lesson.ready);
  const toggle = (key: string) =>
    setSelectedLessons((previous) => {
      const updated = new Set(previous ?? ready.map((lesson) => lesson.key));
      if (updated.has(key)) updated.delete(key);
      else updated.add(key);
      return updated.size === ready.length ? null : updated;
    });
  // a new selection starts the word list and verb list afresh
  const selectionKey = selectedLessons ? [...selectedLessons].sort().join(',') : 'all';

  return (
    <>
      <PageHead title={t('allTitle')}>{t('allIntro')}</PageHead>
      <BankNote bank={bank} />
      <div className="chips" role="group" aria-label={appText.t('lessonsLabel')}>
        <button
          type="button"
          className="chip"
          aria-pressed={!selectedLessons}
          onClick={() => setSelectedLessons(null)}
        >
          {t('all')}
        </button>
        {ready.map((lesson) => (
          <button
            type="button"
            key={lesson.key}
            className="chip"
            aria-pressed={!!selectedLessons && selectedLessons.has(lesson.key)}
            onClick={() => toggle(lesson.key)}
            data-tooltip={lesson.topic || undefined}
          >
            {lesson.word} {lesson.n}
          </button>
        ))}
      </div>
      <section className="panel solo">
        <div className="tabs" role="tablist">
          <button
            type="button"
            className="tab"
            role="tab"
            aria-selected={tab === 'words'}
            onClick={() => setTab('words')}
          >
            {t('words')}
            <span className="count">{words.length}</span>
          </button>
          <button
            type="button"
            className="tab"
            role="tab"
            aria-selected={tab === 'verbs'}
            onClick={() => setTab('verbs')}
          >
            {t('verbs')}
            <span className="count">{analysis.verbs.length}</span>
          </button>
        </div>
        <div className="body">
          {tab === 'words' && <WordsTab key={selectionKey} analysis={analysis} ai={ai} />}
          {tab === 'verbs' && (
            <VerbsTab
              key={selectionKey}
              verbs={analysis.verbs}
              ai={ai}
              waiting={bank.pending > 0}
            />
          )}
        </div>
      </section>
    </>
  );
}
