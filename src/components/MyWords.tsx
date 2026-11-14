import { statWord, useProgress } from '../lib/progress';
import type { Analysis } from '../lib/types';
import { useTranslation } from '../i18n/core';
import { pages } from '../i18n/messages/pages';
import PageHead from './PageHead';
import WordsTab from './WordsTab';

/** The student's list of unfamiliar words: starred by hand or missed in an exercise. */
export default function MyWords({ ai }: { ai: boolean }) {
  const { t } = useTranslation(pages);
  const progress = useProgress();
  const words = Object.values(progress.words)
    .filter((stat) => stat.hard)
    .sort((first, second) => second.last - first.last)
    .map(statWord);
  const analysis: Analysis = {
    language: words[0]?.language ?? 'fr',
    topic: '',
    words,
    pairs: [],
    verbs: [],
    local: false,
  };

  return (
    <>
      <PageHead title={t('myWordsTitle')}>
        {words.length ? t('myWordsIntro', { count: words.length }) : null}
      </PageHead>
      {words.length ? (
        <section className="panel solo">
          <div className="body">
            <WordsTab analysis={analysis} ai={ai} hidePairs />
          </div>
        </section>
      ) : (
        <p className="empty">{t('myWordsEmpty')}</p>
      )}
    </>
  );
}
