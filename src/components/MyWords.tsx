import { useTranslation } from '../i18n/core';
import { learning } from '../i18n/messages/common';
import { pages } from '../i18n/messages/pages';
import { statWord, useProgress } from '../lib/progress';
import { followLink, hrefFor } from '../lib/router';
import { isStudied, useSettings } from '../lib/settings';
import type { Analysis } from '../lib/types';
import LookUpWord from './LookUpWord';
import PageHead from './PageHead';
import WordsTab from './WordsTab';

// The student's list of unfamiliar words: starred by hand or missed in an exercise.
export default function MyWords({ hasClaude }: { hasClaude: boolean }) {
  const { t, rich, locale } = useTranslation(pages);
  const names = useTranslation(learning);
  const progress = useProgress();
  const settings = useSettings();
  const starred = Object.values(progress.words).filter((stat) => stat.hard);
  const words = starred
    .filter((stat) => isStudied(stat.language, settings))
    .sort((first, second) => second.last - first.last)
    .map(statWord);
  // words of a language unticked in Settings stay saved but aren't listed: say so, or the
  // student stars a word in such a lesson and finds the list empty
  const hidden = starred.filter((stat) => !isStudied(stat.language, settings));
  const hiddenLanguages = new Intl.ListFormat(locale, { type: 'conjunction' }).format(
    [...new Set(hidden.map((stat) => stat.language ?? 'fr'))].map((language) =>
      names.t(`name.${language}`)
    )
  );
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
      <PageHead guide="my-words" title={t('myWordsTitle')}>
        {words.length ? t('myWordsIntro', { count: words.length }) : null}
      </PageHead>
      {hasClaude && <LookUpWord />}
      {hidden.length > 0 && (
        <div className="note info">
          <p>
            {rich(
              'myWordsHidden',
              {
                link: (chunk) => (
                  <a
                    href={hrefFor('/settings')}
                    onClick={(event) => followLink(event, '/settings')}
                  >
                    {chunk}
                  </a>
                ),
              },
              { count: hidden.length, languages: hiddenLanguages }
            )}
          </p>
        </div>
      )}
      {words.length ? (
        <section className="panel solo">
          <div className="body">
            <WordsTab analysis={analysis} hasClaude={hasClaude} hidePairs showProgress grouped />
          </div>
        </section>
      ) : (
        !hidden.length && <p className="empty">{t('myWordsEmpty')}</p>
      )}
    </>
  );
}
