import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { setHard, useProgress, wordKey } from '../lib/progress';
import type { Word } from '../lib/types';

/** Adds a word to, or removes it from, the "My words" list. */
export default function Star({ word }: { word: Word }) {
  const { t } = useTranslation(common);
  const isStarred = !!useProgress().words[wordKey(word.fr)]?.hard;
  return (
    <button
      type="button"
      className={'star' + (isStarred ? ' on' : '')}
      aria-pressed={isStarred}
      onClick={() => setHard(word, !isStarred)}
      title={isStarred ? t('removeFromMyWords') : t('addToMyWords')}
      aria-label={t(isStarred ? 'starLabelRemove' : 'starLabelAdd', { word: word.fr })}
    >
      {isStarred ? '★' : '☆'}
    </button>
  );
}
