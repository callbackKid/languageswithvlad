import type { ReactNode } from 'react';

import { useTranslation } from '../i18n/core';
import { talk } from '../i18n/messages/talk';
import type { GrammarRule, Language } from '../lib/types';
import Speak from './Speak';

/** A grammar point explained: what it is, how it's formed, when it's used, examples and the usual
    mistake. Folded away until opened; used in Discuss and in a lesson's Grammar tab. */
export default function GrammarRuleBox({
  rule,
  language,
  label,
  open = false,
  children,
}: {
  rule: GrammarRule;
  language: Language;
  /** the line that opens it */
  label: ReactNode;
  open?: boolean;
  /** buttons under the explanation */
  children?: ReactNode;
}) {
  const { t, language: uiLanguage } = useTranslation(talk);
  return (
    <details className="grammar-rule" open={open}>
      <summary>{label}</summary>
      <div className="grammar-rule-body" lang={uiLanguage}>
        {rule.summary && <p>{rule.summary}</p>}
        {rule.formation.length > 0 && (
          <>
            <h4>{t('ruleFormation')}</h4>
            <ul>
              {rule.formation.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        )}
        {rule.usage.length > 0 && (
          <>
            <h4>{t('ruleUsage')}</h4>
            <ul>
              {rule.usage.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        )}
        {rule.examples.length > 0 && (
          <>
            <h4>{t('ruleExamples')}</h4>
            <ul className="grammar-examples">
              {rule.examples.map((example) => (
                <li key={example.text}>
                  <span lang={language}>{example.text}</span>{' '}
                  <Speak text={example.text} language={language} />
                  {example.translation && (
                    <span className="translation"> — {example.translation}</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
        {rule.pitfall && (
          <p className="grammar-pitfall">
            <b>⚠️ {t('rulePitfall')}:</b> {rule.pitfall}
          </p>
        )}
        {children}
      </div>
    </details>
  );
}
