import { useMemo, useState } from 'react';

import { type Analysis, type Bank, BankNote } from '@/entities/lesson';
import { VerbsTab } from '@/features/conjugate-verb';
import { app, pages, useTranslation } from '@/shared/i18n';
import { useTabs } from '@/shared/lib/useTabs';
import { shownTopic } from '@/shared/lib/util';
import { Button } from '@/shared/ui/controls';
import PageHead from '@/shared/ui/PageHead';
import { WordsTab } from '@/widgets/word-list';

import styles from './Practice.module.css';

// Bound the number of rows rendered for large lesson histories.
const WORDS_PER_PAGE = 50;

// Every exercise, run on the words and verbs of all lessons or the ones picked.
const Practice = ({ bank, hasClaude }: { bank: Bank; hasClaude: boolean }) => {
  const { t } = useTranslation(pages);
  const appText = useTranslation(app);
  const uiLanguage = appText.language;
  // null means every lesson, including ones still being prepared
  const [selectedLessons, setSelectedLessons] = useState<Set<string> | null>(null);
  const [tab, setTab] = useState<'words' | 'verbs'>('words');
  const { tabListProps, tabProps, panelProps } = useTabs(tab);

  const { words: allWords, verbs: allVerbs, pairs, selectVocabulary } = bank;
  const analysis = useMemo((): Analysis => {
    const { words, verbs } = selectedLessons
      ? selectVocabulary(selectedLessons)
      : { words: allWords, verbs: allVerbs };
    const chosenWords = new Set(words.map((word) => word.fr));
    return {
      // lessons can mix languages; each word also carries its own
      language: words[0]?.language ?? 'fr',
      topic: '',
      words,
      local: !hasClaude,
      pairs: pairs.filter(
        (pair) =>
          (!selectedLessons || selectedLessons.has(pair.lesson)) &&
          chosenWords.has(pair.a) &&
          chosenWords.has(pair.b)
      ),
      verbs,
    };
  }, [allWords, allVerbs, pairs, selectVocabulary, selectedLessons, hasClaude]);
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
      <PageHead guide="all-lessons" title={t('allTitle')}>
        {t('allIntro')}
      </PageHead>
      <BankNote bank={bank} />
      <div className={styles.chips} role="group" aria-label={appText.t('lessonsLabel')}>
        <Button
          variant="unstyled"
          className={styles.chip}
          aria-pressed={!selectedLessons}
          onClick={() => setSelectedLessons(null)}
        >
          {t('all')}
        </Button>
        {ready.map((lesson) => (
          <Button
            variant="unstyled"
            key={lesson.key}
            className={styles.chip}
            aria-pressed={!!selectedLessons && selectedLessons.has(lesson.key)}
            onClick={() => toggle(lesson.key)}
            data-tooltip={shownTopic(lesson.topic, uiLanguage) || undefined}
          >
            {lesson.word} {lesson.n}
          </Button>
        ))}
      </div>
      <section className="panel solo">
        <div className="tabs" {...tabListProps} aria-label={appText.t('section.practice')}>
          <Button
            variant="unstyled"
            className="tab"
            {...tabProps('words')}
            onClick={() => setTab('words')}
          >
            {t('words')}
            <span className="count">{words.length}</span>
          </Button>
          <Button
            variant="unstyled"
            className="tab"
            {...tabProps('verbs')}
            onClick={() => setTab('verbs')}
          >
            {t('verbs')}
            <span className="count">{analysis.verbs.length}</span>
          </Button>
        </div>
        <div className="body" {...panelProps('words')}>
          {tab === 'words' && (
            <WordsTab
              key={selectionKey}
              analysis={analysis}
              hasClaude={hasClaude}
              pageSize={WORDS_PER_PAGE}
            />
          )}
        </div>
        <div className="body" {...panelProps('verbs')}>
          {tab === 'verbs' && (
            <VerbsTab
              key={selectionKey}
              verbs={analysis.verbs}
              hasClaude={hasClaude}
              waiting={bank.pending > 0}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default Practice;
