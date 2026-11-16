import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { pages } from '../i18n/messages/pages';
import type { Bank } from '../lib/bank';
import { statWord, topMistakes, useProgress } from '../lib/progress';
import { buildQuiz, type FormQuestion } from '../lib/quiz';
import type { Tense } from '../lib/types';
import { shuffle } from '../lib/util';
import MistakeList from './MistakeList';
import PageHead from './PageHead';
import WordQuiz from './WordQuiz';

/** The words and verb forms missed most often, and a quiz on just those. */
export default function Mistakes({ bank }: { bank: Bank }) {
  const { t } = useTranslation(pages);
  const progress = useProgress();
  const [practise, setPractise] = useState(false);
  const { words, forms } = topMistakes(progress);

  if (practise)
    return (
      <WordQuiz
        title={t('practiseMistakesTitle')}
        closeLabel={t('backToMistakes')}
        onClose={() => setPractise(false)}
        make={() => {
          const mistakes = topMistakes();
          const pickedWords = shuffle(mistakes.words).slice(0, 7).map(statWord);
          const pickedForms: FormQuestion[] = shuffle(mistakes.forms)
            .slice(0, 10 - pickedWords.length)
            .map((form) => ({
              inf: form.inf,
              t: form.t as Tense,
              p: form.p,
              f: form.f,
              negative: form.negative,
            }));
          return buildQuiz(
            pickedWords,
            bank.words.length >= 4 ? bank.words : pickedWords,
            pickedForms
          );
        }}
      />
    );

  return (
    <>
      <PageHead title={t('mistakesTitle')}>
        {words.length || forms.length ? t('mistakesIntro') : null}
      </PageHead>
      {!words.length && !forms.length ? (
        <p className="empty">{t('mistakesEmpty')}</p>
      ) : (
        <>
          <div className="row-actions lead">
            <button type="button" className="btn primary" onClick={() => setPractise(true)}>
              {t('practiseMistakes')}
            </button>
          </div>
          <div className="mistake-cols">
            {words.length > 0 && (
              <section className="panel solo">
                <div className="body">
                  <h2 className="sub-h">{t('words')}</h2>
                  <MistakeList words={words} />
                </div>
              </section>
            )}
            {forms.length > 0 && (
              <section className="panel solo">
                <div className="body">
                  <h2 className="sub-h">{t('verbForms')}</h2>
                  <MistakeList forms={forms} />
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </>
  );
}
