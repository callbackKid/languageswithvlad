import { useState } from 'react';

import type { Tense } from '@/shared/config/languages';
import { useTranslation } from '@/shared/i18n/core';
import { pages } from '@/shared/i18n/messages/pages';
import { shuffle } from '@/shared/lib/util';
import PageHead from '@/shared/ui/PageHead';

import type { Bank } from '../lib/bank';
import { statWord, topMistakes, useProgress } from '../lib/progress';
import { buildQuiz, type FormQuestion } from '../lib/quiz';
import MistakeList from './MistakeList';
import WordQuiz from './WordQuiz';

// The words and verb forms missed most often, and a quiz on just those.
export default function Mistakes({ bank }: { bank: Bank }) {
  const { t } = useTranslation(pages);
  const progress = useProgress();
  const [isPractising, setPractising] = useState(false);
  const { words, forms } = topMistakes(progress);

  if (isPractising)
    return (
      <WordQuiz
        title={t('practiseMistakesTitle')}
        closeLabel={t('backToMistakes')}
        onClose={() => setPractising(false)}
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
      <PageHead guide="mistakes" title={t('mistakesTitle')}>
        {words.length || forms.length ? t('mistakesIntro') : null}
      </PageHead>
      {!words.length && !forms.length ? (
        <p className="empty">{t('mistakesEmpty')}</p>
      ) : (
        <>
          <div className="row-actions lead">
            <button type="button" className="btn primary" onClick={() => setPractising(true)}>
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
