import type { ReactNode } from 'react';

import { Transcription } from '@/entities/word/@x/lesson';
import { type Language } from '@/shared/config';
import { talk, type UiLanguage, useTranslation } from '@/shared/i18n';
import Speak from '@/shared/ui/Speak';

import { type GrammarRule } from '../model/types';

/** A grammar point explained: what it is, how it's formed, when it's used, examples and the usual
    mistake. Folded away until opened; used in Discuss and in a lesson's Grammar and Phonetics tabs. */
export default function GrammarRuleBox({
  rule,
  language,
  label,
  level = 3,
  open = false,
  translationLanguage,
  formationLabel,
  children,
}: {
  rule: GrammarRule;
  language: Language;
  // the line that opens it, which is also the rule's heading
  label: ReactNode;
  // the heading level of that line where the box stands; its parts are one level below
  level?: 2 | 3;
  open?: boolean;
  // the language of the examples' translations, when not the interface's (Discuss: Translations in)
  translationLanguage?: UiLanguage;
  // the heading of the formation lines, when they aren't how a form is built (Phonetics: how it sounds)
  formationLabel?: string;
  // buttons under the explanation
  children?: ReactNode;
}) {
  const { t, language: uiLanguage } = useTranslation(talk);
  const Title = level === 2 ? 'h2' : 'h3';
  const Part = level === 2 ? 'h3' : 'h4';
  return (
    <details className="grammar-rule" open={open}>
      <summary>
        <Title className="grammar-rule-title">{label}</Title>
      </summary>
      <div className="grammar-rule-body" lang={uiLanguage}>
        {rule.summary && <p>{rule.summary}</p>}
        {rule.formation.length > 0 && (
          <>
            <Part>{formationLabel ?? t('ruleFormation')}</Part>
            <ul>
              {rule.formation.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        )}
        {rule.usage.length > 0 && (
          <>
            <Part>{t('ruleUsage')}</Part>
            <ul>
              {rule.usage.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        )}
        {rule.examples.length > 0 && (
          <>
            <Part>{t('ruleExamples')}</Part>
            <ul className="grammar-examples">
              {rule.examples.map((example) => (
                <li key={example.text}>
                  <span lang={language}>{example.text}</span>{' '}
                  {example.transcription && (
                    <>
                      <Transcription tr={example.transcription} />{' '}
                    </>
                  )}
                  <Speak text={example.text} language={language} />
                  {example.translation && (
                    // a translation, maybe in a language being learned: the word menu stays closed on it
                    <span
                      className="translation"
                      data-no-word-actions
                      lang={translationLanguage ?? uiLanguage}
                    >
                      {' '}
                      — {example.translation}
                    </span>
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
