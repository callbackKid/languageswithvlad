import { useCallback, useEffect, useState } from 'react';

import { recordWord, Transcription, type Word } from '@/entities/word';
import { useTranslationLanguage } from '@/shared/config';
import { exercises, useTranslation } from '@/shared/i18n';
import { shuffle } from '@/shared/lib/util';
import { Button } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import Speak from '@/shared/ui/Speak';

// Cards with a word on one side and its translation on the other; a card not known comes back later.
export default function Flashcards({
  words,
  onClose,
  onRestart,
}: {
  words: Word[];
  onClose: () => void;
  onRestart: () => void;
}) {
  const { t } = useTranslation(exercises);
  const [deck, setDeck] = useState(() => shuffle(words));
  // "fr" direction means from the language being learned into the translation language
  const language = words[0]?.language ?? 'fr';
  const translation = useTranslationLanguage()(language);
  const code = language.toUpperCase();
  // the translation language's code: RU, EN… (Settings → Translations in)
  const translationCode = translation.toUpperCase();
  const [done, setDone] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<'fr' | 'ru'>('fr');

  const currentCard = deck[0];
  const know = useCallback(() => {
    if (currentCard) recordWord(currentCard, true);
    setDeck((previous) => previous.slice(1));
    setDone((previous) => previous + 1);
    setFlipped(false);
  }, [currentCard]);
  const again = useCallback(() => {
    if (currentCard) recordWord(currentCard, false);
    setDeck((previous) => {
      const [first, ...others] = previous;
      return first ? [...others, first] : previous;
    });
    setFlipped(false);
  }, [currentCard]);

  useEffect(() => {
    if (!deck.length) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as HTMLElement).matches('input, textarea')) return;
      if (event.key === ' ') {
        event.preventDefault();
        setFlipped((previous) => !previous);
      } else if (event.key === 'ArrowRight') know();
      else if (event.key === 'ArrowLeft') again();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deck.length, know, again]);

  const directionToggle = (
    <span className="seg" role="group" aria-label={t('direction')}>
      <Button
        variant="unstyled"
        aria-pressed={direction === 'fr'}
        onClick={() => {
          setDirection('fr');
          setFlipped(false);
        }}
      >
        {code} → {translationCode}
      </Button>
      <Button
        variant="unstyled"
        aria-pressed={direction === 'ru'}
        onClick={() => {
          setDirection('ru');
          setFlipped(false);
        }}
      >
        {translationCode} → {code}
      </Button>
    </span>
  );

  const card = deck[0];
  if (!card)
    return (
      <div className="ex">
        <ExerciseHead title={t('flashcards')} onClose={onClose}>
          {directionToggle}
        </ExerciseHead>
        <p className="score">{t('cardsDone', { count: words.length })}</p>
        <div className="row-actions">
          <Button variant="primary" onClick={onRestart}>
            {t('startOver')}
          </Button>
        </div>
      </div>
    );

  const [front, back] = direction === 'fr' ? [card.fr, card.ru] : [card.ru, card.fr];
  return (
    <div className="ex">
      <ExerciseHead title={t('flashcards')} onClose={onClose}>
        <span className="progress">{t('known', { done, total: words.length })}</span>
        {directionToggle}
      </ExerciseHead>
      <Button
        variant="unstyled"
        className="card"
        onClick={() => setFlipped((previous) => !previous)}
        aria-label={t('flipCard')}
      >
        <span className="face" lang={direction === 'fr' ? language : translation}>
          {front}
        </span>
        {direction === 'fr' && card.tr && <Transcription tr={card.tr} />}
        {flipped ? (
          <span className="back" lang={direction === 'fr' ? translation : language}>
            {back}
            {direction === 'ru' && card.tr && (
              <>
                {' '}
                <Transcription tr={card.tr} />
              </>
            )}
          </span>
        ) : (
          <span className="sub">{t('tapToSee')}</span>
        )}
      </Button>
      <div className="card-actions">
        <Speak text={card.fr} language={language} />
        <Button className="big" onClick={again}>
          {t('again')}
        </Button>
        <Button variant="primary" className="big" onClick={know}>
          {t('iKnowIt')}
        </Button>
      </div>
      <p className="kbd">{t('keys')}</p>
    </div>
  );
}
