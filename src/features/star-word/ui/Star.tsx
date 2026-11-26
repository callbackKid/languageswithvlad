import { setHard, useProgress, type Word, wordKey } from '@/entities/word';
import { common, useTranslation } from '@/shared/i18n';
import { IconButton } from '@/shared/ui/controls';

// Adds a word to, or removes it from, the "Words to learn" list.
const Star = ({ word }: { word: Word }) => {
  const { t } = useTranslation(common);
  const isStarred = !!useProgress().words[wordKey(word.fr)]?.hard;
  return (
    <IconButton
      className={'star' + (isStarred ? ' on' : '')}
      aria-pressed={isStarred}
      onClick={() => setHard(word, !isStarred)}
      tooltip={isStarred ? t('removeFromMyWords') : t('addToMyWords')}
      label={t(isStarred ? 'starLabelRemove' : 'starLabelAdd', { word: word.fr })}
    >
      {isStarred ? '★' : '☆'}
    </IconButton>
  );
};

export default Star;
