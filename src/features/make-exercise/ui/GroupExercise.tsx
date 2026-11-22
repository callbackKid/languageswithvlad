import { useState } from 'react';

import { getProgress, type Word } from '@/entities/word';
import { api } from '@/shared/api';
import { getSettings, translationLanguage } from '@/shared/config';
import { common, useTranslation } from '@/shared/i18n';
import ExerciseHead from '@/shared/ui/ExerciseHead';

import { makeExerciseText } from '../i18n/makeExercise';
import { GROUP_QUESTIONS, MIN_GROUP_WORDS, wordsForGroupExercise } from '../model/groupWords';
import { normalizeExercise } from '../model/normalize';
import RoundLoader from './RoundLoader';

/** A round of GROUP_QUESTIONS mixed questions by Claude on one group of words, at the student's
    level; made when it opens and again with Create another, never saved. name is the group's
    name as shown. */
export default function GroupExercise({
  words,
  name,
  onClose,
}: {
  words: Word[];
  name: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(makeExerciseText);
  const commonText = useTranslation(common);
  const [practised] = useState(() => wordsForGroupExercise(words, getProgress()));

  // too few words in one language (the button checks this first, so it is rare)
  if (!practised)
    return (
      <div className="ex made-exercise">
        <ExerciseHead
          title={t('groupTitle', { name })}
          onClose={onClose}
          closeLabel={commonText.t('close')}
        />
        <div className="note err" role="alert">
          <p>{t('groupTooFew', { count: MIN_GROUP_WORDS })}</p>
        </div>
      </div>
    );

  const { language } = practised;
  return (
    <RoundLoader
      title={t('groupTitle', { name })}
      language={language}
      waiting={t('making', { count: GROUP_QUESTIONS })}
      load={async () =>
        normalizeExercise(
          await api.exercise({
            language,
            level: getSettings().levels[language],
            grammar: '',
            words: practised.words,
            count: GROUP_QUESTIONS,
          }),
          language,
          translationLanguage(language)
        )
      }
      onClose={onClose}
    />
  );
}
