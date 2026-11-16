import { useEffect } from 'react';

import { useTranslation } from '../i18n/core';
import { app } from '../i18n/messages/app';
import { newsText } from '../i18n/messages/news';
import { markNewsSeen, NEWS } from '../lib/news';
import PageHead from './PageHead';

/** What changed in the app, by day. Opening it clears the dot next to News in the menu. */
export default function News({ onSeen }: { onSeen: () => void }) {
  const { t, language, locale } = useTranslation(newsText);
  const sectionNames = useTranslation(app);
  useEffect(() => {
    markNewsSeen();
    onSeen();
  }, [onSeen]);

  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dateOf = (date: string) => {
    const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <>
      <PageHead title={sectionNames.t('section.news')}>{t('intro')}</PageHead>
      <ol className="news">
        {NEWS.map((day) => (
          <li key={day.date} className="news-day">
            <h2>
              <time dateTime={day.date}>{dateFormat.format(dateOf(day.date))}</time>
            </h2>
            <ul>
              {day.items.map((item) => (
                <li key={item.text.en} className="news-item">
                  <span className={'news-kind ' + item.kind}>{t(`kind.${item.kind}`)}</span>
                  <span>{item.text[language]}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}
