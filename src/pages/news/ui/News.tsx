import { useEffect, useState } from 'react';

import { markNewsSeen } from '@/entities/news';
import { type Language, useSettings, useTeacher } from '@/shared/config';
import { app, learning, useTranslation } from '@/shared/i18n';
import { useTabs } from '@/shared/lib/useTabs';
import { Button, Select } from '@/shared/ui/controls';
import PageHead from '@/shared/ui/PageHead';

import { newsText } from '../i18n/news';
import {
  NEWS,
  NEWS_AUDIENCES,
  NEWS_TABS,
  type NewsAudience,
  newsFor,
  type NewsTab,
} from '../model/news';
import styles from './News.module.css';

/** What changed in the app, by day: new features and fixes on two tabs, for one of the student's
    languages (the news about every language stays), and for the teacher, by audience. Opening
    the page clears the dot next to News in the menu. */
const News = ({ onSeen }: { onSeen: () => void }) => {
  const { t, language: uiLanguage, locale } = useTranslation(newsText);
  const sectionNames = useTranslation(app);
  const names = useTranslation(learning);
  const { isTeacher } = useTeacher();
  const { studying } = useSettings();
  const [tab, setTab] = useState<NewsTab>('new');
  const { tabListProps, tabProps, panelProps } = useTabs(tab);
  // a student of one language sees that language's news at once
  const [chosenLanguage, setLanguage] = useState<Language | 'all'>(() =>
    studying.length === 1 ? (studying[0] ?? 'all') : 'all'
  );
  const [chosenAudience, setAudience] = useState<NewsAudience>('all');
  useEffect(() => {
    markNewsSeen();
    onSeen();
  }, [onSeen]);

  // a language dropped in Settings is no longer offered
  const shownLanguage: Language | 'all' =
    chosenLanguage !== 'all' && studying.includes(chosenLanguage) ? chosenLanguage : 'all';
  // the teacher's tools are news only for the teacher
  const audience: NewsAudience = isTeacher ? chosenAudience : 'student';
  const choice = { language: shownLanguage, audience };
  const days = newsFor(NEWS, { ...choice, tab });
  const countOf = (shown: NewsTab) =>
    newsFor(NEWS, { ...choice, tab: shown }).reduce((sum, day) => sum + day.items.length, 0);

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
      <PageHead guide="news" title={sectionNames.t('section.news')}>
        {t('intro')}
      </PageHead>
      <div className={styles['news-filters']}>
        {studying.length > 1 && (
          <label className={styles['news-filter']}>
            <span>{t('filterLanguage')}</span>
            <Select
              value={shownLanguage}
              onChange={(event) => {
                const value = event.target.value;
                setLanguage(studying.find((language) => language === value) ?? 'all');
              }}
            >
              <option value="all">{t('allLanguages')}</option>
              {studying.map((language) => (
                <option key={language} value={language}>
                  {names.t(`name.${language}`)}
                </option>
              ))}
            </Select>
          </label>
        )}
        {isTeacher && (
          <div className="seg" role="group" aria-label={t('filterAudience')}>
            {NEWS_AUDIENCES.map((shown) => (
              <Button
                variant="unstyled"
                key={shown}
                aria-pressed={chosenAudience === shown}
                onClick={() => setAudience(shown)}
              >
                {t(`audience.${shown}`)}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div
        className={`tabs ${styles['news-tabs']}`}
        {...tabListProps}
        aria-label={sectionNames.t('section.news')}
      >
        {NEWS_TABS.map((shown) => (
          <Button
            variant="unstyled"
            key={shown}
            className="tab"
            {...tabProps(shown)}
            onClick={() => setTab(shown)}
          >
            {t(`tab.${shown}`)}
            <span className="count">{countOf(shown)}</span>
          </Button>
        ))}
      </div>
      {NEWS_TABS.map((shown) => shown !== tab && <div key={shown} {...panelProps(shown)} />)}
      <div key={tab} {...panelProps(tab)}>
        {days.length ? (
          <ol className={styles.news}>
            {days.map((day) => (
              <li key={day.date} className={styles['news-day']}>
                <h2>
                  <time dateTime={day.date}>{dateFormat.format(dateOf(day.date))}</time>
                </h2>
                <ul>
                  {day.items.map((item) => (
                    <li key={item.text.en} className={styles['news-item']}>
                      {/* on the fixes tab every item is a fix: the label would say nothing */}
                      {tab === 'new' && (
                        <span className={`${styles['news-kind']} ${styles[item.kind]}`}>
                          {t(`kind.${item.kind}`)}
                        </span>
                      )}
                      <span>
                        {item.text[uiLanguage]}
                        {item.languages && shownLanguage === 'all' && (
                          <span className={styles['news-languages']}>
                            {item.languages
                              .map((language) => names.t(`name.${language}`))
                              .join(', ')}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty">{t('empty')}</p>
        )}
      </div>
    </>
  );
};

export default News;
