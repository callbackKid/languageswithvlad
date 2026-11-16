import { type ReactNode, useEffect, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { FACTS } from '../lib/facts';
import type { Language } from '../lib/types';

const ROTATE_EVERY = 8000;
// "Did you know?" in the language being learned
const LABELS: Record<Language, string> = {
  fr: 'Le saviez-vous ?',
  en: 'Did you know?',
  de: 'Schon gewusst?',
  es: '¿Sabías que…?',
  pt: 'Sabias que…?',
  it: 'Lo sapevi?',
};

/** What's happening, plus a fact about the language that changes every few seconds, while the student waits for Claude. */
export default function WaitingFact({
  children,
  language = 'fr',
}: {
  children: ReactNode;
  language?: Language;
}) {
  const { t, language: uiLanguage } = useTranslation(common);
  const facts = FACTS[language];
  // a different first fact each time, so waiting twice doesn't show the same one
  const [position, setPosition] = useState(() => Math.floor(Math.random() * facts.length));
  const next = () => setPosition((previous) => (previous + 1) % facts.length);
  useEffect(() => {
    const timer = window.setInterval(
      () => setPosition((previous) => (previous + 1) % facts.length),
      ROTATE_EVERY
    );
    return () => window.clearInterval(timer);
  }, [facts.length]);
  const fact = facts[position % facts.length];

  return (
    <div className="waiting" role="status">
      <p className="waiting-line">
        <span className="spinner" /> {children}
      </p>
      {fact && (
        <figure className="fact">
          <span className="fact-label" lang={language}>
            {LABELS[language]}
          </span>
          <b className="fact-phrase" lang={language}>
            {fact.phrase}
          </b>
          <figcaption>{fact.note[uiLanguage]}</figcaption>
          <button type="button" className="btn ghost flush fact-next" onClick={next}>
            {t('nextFact')}
          </button>
        </figure>
      )}
    </div>
  );
}
