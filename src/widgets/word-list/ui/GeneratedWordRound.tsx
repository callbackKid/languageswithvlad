import { useId, useState } from 'react';

import { type Word } from '@/entities/word';
import { GapFill } from '@/features/gap-fill';
import { type Language } from '@/shared/config';
import { exercises, learning, useTranslation } from '@/shared/i18n';
import { Button } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';

import WordBlitz from './WordBlitz';

type GeneratedRoundKind = 'gap' | 'blitz';

// Keep the chosen words and their language together for the round and any retries.
const GeneratedWordRound = ({
  kind,
  words,
  onClose,
}: {
  kind: GeneratedRoundKind;
  words: Word[];
  onClose: () => void;
}) => {
  const { t } = useTranslation(exercises);
  const names = useTranslation(learning);
  const choiceLabel = useId();
  const [byLanguage] = useState(() => {
    const groups = new Map<Language, Word[]>();
    for (const word of words) {
      if (kind === 'blitz' && !word.ru) continue;
      const language = word.language ?? 'fr';
      const group = groups.get(language);
      if (group) group.push(word);
      else groups.set(language, [word]);
    }
    return groups;
  });
  const [language, setLanguage] = useState(() =>
    byLanguage.size === 1 ? byLanguage.keys().next().value : undefined
  );
  const [round, setRound] = useState(0);
  const selected = language && byLanguage.get(language);
  const restart = () => setRound((previous) => previous + 1);
  if (selected)
    return kind === 'gap' ? (
      <GapFill key={round} words={selected} onClose={onClose} onRestart={restart} />
    ) : (
      <WordBlitz key={round} words={selected} onClose={onClose} onRestart={restart} />
    );

  return (
    <div className="ex">
      <ExerciseHead title={t(kind === 'gap' ? 'fillGap' : 'blitz')} onClose={onClose} />
      <p id={choiceLabel}>{t(byLanguage.size ? 'chooseRoundLanguage' : 'noVocabulary')}</p>
      {byLanguage.size > 0 && (
        <div className="row-actions" role="group" aria-labelledby={choiceLabel}>
          {[...byLanguage.keys()].map((option, index) => (
            <Button key={option} autoFocus={index === 0} onClick={() => setLanguage(option)}>
              {names.t(`name.${option}`)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneratedWordRound;
