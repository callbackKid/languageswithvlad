import { type ReactNode, useEffect } from 'react';

import { GUIDES, type Section, SECTIONS, useTeacher } from '@/shared/config';
import { app, exercises, pages, paper, useTranslation } from '@/shared/i18n';
import { followLink, hrefFor } from '@/shared/lib/router';
import PageHead from '@/shared/ui/PageHead';

import { tutorial } from '../i18n/tutorial';

/* A guide for someone opening the app for the first time: a quick start, a map of the sections,
   then one card per section with what it is for, how to use it, a small picture of the screen
   and a link that opens it. The pictures are drawings, not working controls. The texts live in
   shared/i18n/messages/tutorial.ts; the drawings reuse the real labels of the app. */

type TutorialKey = keyof (typeof tutorial)['en'];

// A drawn button, looking like the real one.
const Button = ({ children, primary }: { children: ReactNode; primary?: boolean }) => (
  <span className={'mock-btn' + (primary ? ' primary' : '')}>{children}</span>
);
const Key = ({ children }: { children: ReactNode }) => <kbd className="key">{children}</kbd>;

function OpenLink({ section, children }: { section: Section; children?: ReactNode }) {
  const { t } = useTranslation(tutorial);
  const sectionName = useTranslation(app).t(`section.${section}`);
  const entry = SECTIONS.find((candidate) => candidate.id === section);
  if (!entry) return null;
  return (
    <a
      className="open-link"
      href={hrefFor(entry.path)}
      onClick={(event) => followLink(event, entry.path)}
    >
      {children ?? t('open', { section: sectionName })} →
    </a>
  );
}

// The markup the tutorial texts may use.
const TAGS: Record<string, (chunk: ReactNode) => ReactNode> = {
  b: (chunk) => <b>{chunk}</b>,
  ex: (chunk) => <span className="example">{chunk}</span>,
  btn: (chunk) => <Button>{chunk}</Button>,
  pbtn: (chunk) => <Button primary>{chunk}</Button>,
  key: (chunk) => <Key>{chunk}</Key>,
  added: (chunk) => <span className="added">{chunk}</span>,
  lessons: (chunk) => <OpenLink section="lessons">{chunk}</OpenLink>,
  mine: (chunk) => <OpenLink section="mine">{chunk}</OpenLink>,
  home: (chunk) => <OpenLink section="home">{chunk}</OpenLink>,
};

const QUICK_START = [1, 2, 3, 4];
const range = (count: number) => Array.from({ length: count }, (_value, index) => index + 1);

// The drawings of the screen, labelled with the same texts the app shows.
function MockBody({ id }: { id: string }) {
  const { t: appText, rich: appRich } = useTranslation(app);
  const exercise = useTranslation(exercises).t;
  const page = useTranslation(pages).t;
  const lessonText = useTranslation(paper).t;
  switch (id) {
    case 'header':
      return (
        <div className="mock-row">
          <span className="mock-text">
            {appRich(
              'nextLesson',
              { b: (chunk) => <b>{chunk}</b> },
              { when: `${appText('tomorrow')}, 18:00` }
            )}
          </span>
          <Button primary>{appText('enterLesson')}</Button>
          <Button>↻</Button>
          <Button>⚙️ {appText('section.settings')}</Button>
        </div>
      );
    case 'home':
      return (
        <div className="mock-row">
          <b>{page('streak', { count: 4 })}</b>
          <span className="mock-bar">
            <span style={{ width: '60%' }} />
          </span>
          <span className="mock-text">{page('goalProgress', { count: 12, goal: 20 })}</span>
        </div>
      );
    case 'lessons':
      return (
        <>
          <div className="mock-tabs">
            <span className="on">
              {lessonText('words')} <i>24</i>
            </span>
            <span>
              {lessonText('verbs')} <i>5</i>
            </span>
            <span>{lessonText('myNotes')}</span>
            <span>{lessonText('original')}</span>
          </div>
          <div className="mock-row">
            <Button primary>{exercise('quiz')}</Button>
            <Button>{exercise('flashcards')}</Button>
            <Button>{exercise('matchTranslations')}</Button>
            <Button>{exercise('dictation')}</Button>
          </div>
          <div className="mock-word">
            <span className="tick">☑</span>
            <span className="fr">bonjour</span>
            <span className="tr">[bɔ̃ʒuʁ]</span>
            <span className="ru">привет</span>
            <span>🔊</span>
            <span>☆</span>
          </div>
          <div className="mock-word">
            <span className="tick">☑</span>
            <span className="fr">la boulangerie</span>
            <span className="ru">
              пекарня <span className="added">✱</span>
            </span>
            <span>🔊</span>
            <span>★</span>
          </div>
        </>
      );
    case 'verbs':
      return (
        <>
          <div className="mock-row">
            <span className="mock-pill on">présent</span>
            <span className="mock-pill">passé composé</span>
            <span className="mock-pill">imparfait</span>
            <span className="mock-pill">futur simple</span>
          </div>
          <div className="mock-table">
            <span>je</span>
            <span className="fr">me réveille 🔊</span>
            <span>tu</span>
            <span className="fr">te réveilles 🔊</span>
            <span>nous</span>
            <span className="fr">nous réveillons 🔊</span>
          </div>
        </>
      );
    case 'all-lessons':
      return (
        <div className="mock-row">
          <span className="mock-pill on">{page('all')}</span>
          <span className="mock-pill">Leçon 5</span>
          <span className="mock-pill">Leçon 6</span>
          <span className="mock-pill">Leçon 7</span>
        </div>
      );
    case 'photo':
      return (
        <div className="mock-photo">
          <span className="head">{lessonText('colUnderlined')}</span>
          <span className="head">{lessonText('colTranslation')}</span>
          <span className="head">{lessonText('colForm')}</span>
          <span className="fr">avait raison</span>
          <span>был прав</span>
          <span>
            <i>avoir raison</i> · imparfait
          </span>
          <span className="fr">assommé</span>
          <span>оглушённый</span>
          <span>
            <i>assommer</i> · participe passé
          </span>
        </div>
      );
    default:
      return null;
  }
}

// A guide to every part of the app, for someone using it for the first time.
export default function Tutorial() {
  const { t, rich } = useTranslation(tutorial);
  const text = (key: string) => rich(key as TutorialKey, TAGS);
  const plain = (key: string) => t(key as TutorialKey);
  const { isTeacher } = useTeacher();
  // opened from a page's "?" (/tutorial#guide-verbs): go straight to that card
  useEffect(() => {
    const part = window.location.hash.slice(1);
    if (part) document.getElementById(part)?.scrollIntoView();
  }, []);
  return (
    <>
      <PageHead title={t('title')}>{t('intro')}</PageHead>

      <section className="tutorial-block" aria-labelledby="quick-start">
        <h2 id="quick-start">{t('quickStart')}</h2>
        <ol className="quick-start">
          {QUICK_START.map((step) => (
            <li key={step}>
              <span className="step-number">{step}</span>
              <b>{plain(`quick${step}.title`)}</b>
              <p>{text(`quick${step}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tutorial-block" aria-labelledby="map">
        <h2 id="map">{t('map')}</h2>
        <div className="guide-map">
          {GUIDES.map((guide) => (
            <a key={guide.id} className="guide-card" href={'#guide-' + guide.id}>
              <span className="icon" aria-hidden="true">
                {guide.icon}
              </span>
              <b>{plain(`${guide.id}.title`)}</b>
              <span>{plain(`${guide.id}.summary`)}</span>
            </a>
          ))}
        </div>
      </section>

      {GUIDES.map((guide) => (
        <section key={guide.id} id={'guide-' + guide.id} className="guide">
          <header className="guide-head">
            <h2>
              <span className="icon" aria-hidden="true">
                {guide.icon}
              </span>{' '}
              {plain(`${guide.id}.title`)}
            </h2>
            {guide.section && <OpenLink section={guide.section} />}
          </header>
          <p>{text(`${guide.id}.intro`)}</p>
          <div className={'guide-body' + (guide.mock ? ' with-mock' : '')}>
            <div>
              <h3>{t('howTo')}</h3>
              <ol className="guide-steps">
                {range(guide.steps).map((step) => (
                  <li key={step}>{text(`${guide.id}.step${step}`)}</li>
                ))}
              </ol>
              {guide.tips && (
                <>
                  <h3>{t('goodToKnow')}</h3>
                  <ul className="guide-tips">
                    {range(guide.tips)
                      .filter((tip) => isTeacher || !guide.teacherTips?.includes(tip))
                      .map((tip) => (
                        <li key={tip}>{text(`${guide.id}.tip${tip}`)}</li>
                      ))}
                  </ul>
                </>
              )}
            </div>
            {guide.mock && (
              <figure
                className="mock"
                aria-label={t('pictureOf', { label: plain(`${guide.id}.mock`) })}
              >
                <div className="mock-body" aria-hidden="true">
                  <MockBody id={guide.id} />
                </div>
                <figcaption>{plain(`${guide.id}.mock`)}</figcaption>
              </figure>
            )}
          </div>
          <a className="back-to-top" href="#map">
            {t('backToMap')}
          </a>
        </section>
      ))}

      <section className="guide" id="guide-storage">
        <h2>
          <span className="icon" aria-hidden="true">
            💾
          </span>{' '}
          {t('storageTitle')}
        </h2>
        <p>{t('storageText')}</p>
      </section>
    </>
  );
}
