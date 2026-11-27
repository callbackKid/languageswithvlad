import { languageOfTense, useTranslationLanguage } from '@/shared/config';
import { common, useTranslation } from '@/shared/i18n';

import { type FormStat, type WordStat } from '../model/progress';
import styles from './MistakeList.module.css';
import Transcription from './Transcription';

// Missed words and verb forms with how often each was missed.
const MistakeList = ({ words = [], forms = [] }: { words?: WordStat[]; forms?: FormStat[] }) => {
  const { t } = useTranslation(common);
  const translationOf = useTranslationLanguage();
  return (
    <ul className={styles.mistakes}>
      {words.map((stat) => (
        <li key={'w' + stat.fr}>
          <span className={styles.word} lang={stat.language ?? 'fr'}>
            {stat.fr}
            {stat.tr && (
              <>
                {' '}
                <Transcription tr={stat.tr} />
              </>
            )}
          </span>
          <span
            className={styles.translation}
            data-no-word-actions
            lang={translationOf(stat.language)}
          >
            {stat.ru || '—'}
          </span>
          <span className={styles.count}>{t('missed', { count: stat.wrong })}</span>
        </li>
      ))}
      {forms.map((stat) => (
        <li key={'f' + stat.inf + stat.t + stat.p + (stat.negative ? '|ne' : '')}>
          <span className={styles.word} lang={languageOfTense(stat.t)}>
            {stat.p} {stat.f}
          </span>
          <span className={styles.translation}>
            <i lang={languageOfTense(stat.t)}>{stat.inf}</i>, {stat.t}
            {stat.negative && `, ${t('negative')}`}
          </span>
          <span className={styles.count}>{t('missed', { count: stat.wrong })}</span>
        </li>
      ))}
    </ul>
  );
};

export default MistakeList;
