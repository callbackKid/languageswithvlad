import type { FormStat, WordStat } from '../lib/progress';
import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import Transcription from './Transcription';

/** Missed words and verb forms with how often each was missed. */
export default function MistakeList({
  words = [],
  forms = [],
}: {
  words?: WordStat[];
  forms?: FormStat[];
}) {
  const { t } = useTranslation(common);
  return (
    <ul className="mistakes">
      {words.map((stat) => (
        <li key={'w' + stat.fr}>
          <span className="fr" lang={stat.language ?? 'fr'}>
            {stat.fr}
            {stat.tr && (
              <>
                {' '}
                <Transcription tr={stat.tr} />
              </>
            )}
          </span>
          <span className="ru" lang="ru">
            {stat.ru || '—'}
          </span>
          <span className="miss">{t('missed', { count: stat.wrong })}</span>
        </li>
      ))}
      {forms.map((stat) => (
        <li key={'f' + stat.inf + stat.t + stat.p + (stat.negative ? '|ne' : '')}>
          <span className="fr" lang="fr">
            {stat.p} {stat.f}
          </span>
          <span className="ru">
            <i lang="fr">{stat.inf}</i>, {stat.t}
            {stat.negative && `, ${t('negative')}`}
          </span>
          <span className="miss">{t('missed', { count: stat.wrong })}</span>
        </li>
      ))}
    </ul>
  );
}
