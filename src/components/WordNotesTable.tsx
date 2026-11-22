import { useTranslation } from '@/shared/i18n/core';
import { paper } from '@/shared/i18n/messages/paper';
import Speak from '@/shared/ui/Speak';

import type { PhotoItem, Word } from '../lib/types';
import Star from './Star';

// What goes onto Words to learn: the dictionary form when there is one.
const asWord = (item: PhotoItem): Word => ({
  fr: item.base || item.fr,
  ru: item.ru,
  tr: '',
  kind: item.kind,
  added: false,
  language: item.language ?? 'fr',
});

/** Words and phrases the student marked (on a photo or in a pasted text), each with its
    translation in context, dictionary form, tense and a short explanation. */
export default function WordNotesTable({
  items,
  firstColumn,
}: {
  items: PhotoItem[];
  // the heading of the first column: "Underlined", "Word or phrase"
  firstColumn: string;
}) {
  const { t } = useTranslation(paper);
  return (
    <div className="photo-table-wrap">
      <table className="photo-table">
        <thead>
          <tr>
            <th>{firstColumn}</th>
            <th>{t('colTranslation')}</th>
            <th>{t('colForm')}</th>
            <th>{t('colExplanation')}</th>
            <th aria-label={t('colActions')} />
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const language = item.language ?? 'fr';
            return (
              <tr key={index}>
                <td>
                  <b lang={language}>{item.fr}</b>
                  {item.context && (
                    <div className="context" lang={language}>
                      {item.context}
                    </div>
                  )}
                </td>
                <td lang="ru">{item.ru}</td>
                <td>
                  {item.base && (
                    <div lang={language}>
                      <i>{item.base}</i>
                    </div>
                  )}
                  {item.tense && <div className="tense">{item.tense}</div>}
                  {!item.base && !item.tense && <span className="muted">—</span>}
                </td>
                <td lang="ru" className="explanation">
                  {item.explanation}
                </td>
                <td className="actions">
                  <Speak text={item.fr} language={language} />
                  <Star word={asWord(item)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="legend">{t('photoStarLegend')}</p>
    </div>
  );
}
