import { setHard, useProgress, type Word, wordKey } from '@/entities/word';
import { useTranslation } from '@/shared/i18n/core';
import { common } from '@/shared/i18n/messages/common';

// Adds a word to, or removes it from, the "Words to learn" list.
export default function Star({ word }: { word: Word }) {
  const { t } = useTranslation(common);
  const isStarred = !!useProgress().words[wordKey(word.fr)]?.hard;
  return (
    <button
      type="button"
      className={'star' + (isStarred ? ' on' : '')}
      aria-pressed={isStarred}
      onClick={() => setHard(word, !isStarred)}
      data-tooltip={isStarred ? t('removeFromMyWords') : t('addToMyWords')}
      aria-label={t(isStarred ? 'starLabelRemove' : 'starLabelAdd', { word: word.fr })}
    >
      {isStarred ? '★' : '☆'}
    </button>
  );
}
