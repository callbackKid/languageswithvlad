import { useState } from 'react';

import { type Bank, buildQuiz, type FormQuestion } from '@/entities/lesson';
import { MistakeList, statWord, topMistakes, useProgress } from '@/entities/word';
import { WordQuiz } from '@/features/quiz';
import { type Tense } from '@/shared/config';
import { pages, useTranslation } from '@/shared/i18n';
import { shuffle } from '@/shared/lib/util';
import { Button } from '@/shared/ui/controls';
import PageHead from '@/shared/ui/PageHead';

import styles from './Mistakes.module.css';

// The words and verb forms missed most often, and a quiz on just those.
const Mistakes = ({ bank }: { bank: Bank }) => {
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
            <Button variant="primary" onClick={() => setPractising(true)}>
              {t('practiseMistakes')}
            </Button>
          </div>
          <div className={styles['mistake-cols']}>
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
};

export default Mistakes;
