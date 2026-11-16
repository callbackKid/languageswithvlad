import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Bank } from '../lib/bank';
import { normDiscussion } from '../lib/parse';
import { load, save } from '../lib/storage';
import { LEVELS, useSettings } from '../lib/settings';
import type { Discussion, GrammarRule, Language } from '../lib/types';
import { useTranslation } from '../i18n/core';
import { common, learning } from '../i18n/messages/common';
import { talk } from '../i18n/messages/talk';
import PageHead from './PageHead';
import Speak from './Speak';
import Star from './Star';
import WaitingFact from './WaitingFact';

const CUSTOM = '__custom';

const TOPICS: Record<Language, string[]> = {
  fr: [
    'La famille',
    'Les amis',
    'Le travail',
    'Les études',
    'Les voyages',
    'La nourriture',
    'Le logement',
    'La ville',
    'Les loisirs',
    'Le sport',
    'La santé',
    'Les vacances',
    'Les achats',
    'La technologie',
    'L’environnement',
    'La culture et l’art',
    'Les fêtes',
    'L’enfance',
    'Les projets',
    'La France et la francophonie',
  ],
  en: [
    'Family',
    'Friends',
    'Work',
    'Studies',
    'Travel',
    'Food',
    'Home',
    'The city',
    'Free time',
    'Sport',
    'Health',
    'Holidays',
    'Shopping',
    'Technology',
    'The environment',
    'Culture and art',
    'Celebrations',
    'Childhood',
    'Plans',
    'English-speaking countries',
  ],
  de: [
    'Die Familie',
    'Freunde',
    'Die Arbeit',
    'Das Studium',
    'Reisen',
    'Essen und Trinken',
    'Wohnen',
    'Die Stadt',
    'Freizeit',
    'Sport',
    'Gesundheit',
    'Urlaub',
    'Einkaufen',
    'Technik',
    'Die Umwelt',
    'Kultur und Kunst',
    'Feste',
    'Die Kindheit',
    'Pläne',
    'Deutschland, Österreich und die Schweiz',
  ],
};

const GRAMMAR: Record<Language, string[]> = {
  fr: [
    'Le présent',
    'Le passé composé',
    'L’imparfait',
    'Passé composé ou imparfait',
    'Le futur proche',
    'Le futur simple',
    'Le conditionnel',
    'Le subjonctif',
    'L’impératif',
    'Les verbes pronominaux',
    'La négation',
    'Les questions',
    'Les pronoms COD et COI',
    'Les pronoms y et en',
    'Le comparatif et le superlatif',
    'Les pronoms relatifs (qui, que, où, dont)',
  ],
  en: [
    'Present simple',
    'Present continuous',
    'Past simple',
    'Past continuous',
    'Present perfect',
    'Future: will and going to',
    'Conditionals',
    'Modal verbs',
    'Questions',
    'Comparatives and superlatives',
    'The passive',
    'Reported speech',
  ],
  de: [
    'Präsens',
    'Perfekt',
    'Präteritum',
    'Perfekt oder Präteritum',
    'Futur I',
    'Modalverben',
    'Trennbare Verben',
    'Reflexive Verben',
    'Akkusativ und Dativ',
    'Wechselpräpositionen',
    'Adjektivdeklination',
    'Nebensätze (weil, dass, wenn)',
    'Konjunktiv II',
    'Imperativ',
    'Komparativ und Superlativ',
    'Das Passiv',
    'Relativsätze',
  ],
};

interface Choice {
  language: Language;
  level: string;
  topic: string;
  customTopic: string;
  grammar: string;
  customGrammar: string;
}
const DEFAULT_CHOICE: Choice = {
  language: 'fr',
  level: 'A2',
  topic: TOPICS.fr[0] ?? '',
  customTopic: '',
  grammar: '',
  customGrammar: '',
};

/** A topic or grammar dropdown with an "Other…" choice that opens a text field. */
function TopicSelect({
  label,
  options,
  extra,
  value,
  custom,
  noneLabel,
  allowCustom = true,
  dimmed = false,
  onChange,
  onCustom,
}: {
  label: string;
  options: string[];
  /** more choices in their own group, e.g. the topics of the lessons */
  extra?: { label: string; options: string[] };
  value: string;
  custom: string;
  noneLabel?: string;
  /** offer "Other…" with a text field (the vocabulary topic has its own field instead) */
  allowCustom?: boolean;
  /** shown greyed out: something else (the student's own topic) is used instead */
  dimmed?: boolean;
  onChange: (value: string) => void;
  onCustom: (value: string) => void;
}) {
  const { t } = useTranslation(talk);
  return (
    <label className={'discuss-field' + (dimmed ? ' dimmed' : '')}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {noneLabel !== undefined && <option value="">{noneLabel}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        {extra && extra.options.length > 0 && (
          <optgroup label={extra.label}>
            {extra.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </optgroup>
        )}
        {allowCustom && <option value={CUSTOM}>{t('other')}</option>}
      </select>
      {value === CUSTOM && (
        <input
          type="text"
          value={custom}
          maxLength={120}
          placeholder={t('typeYourOwn')}
          onChange={(event) => onCustom(event.target.value)}
        />
      )}
    </label>
  );
}

/** The chosen grammar point explained, folded away until the student opens it. */
function GrammarRuleBox({ rule, language }: { rule: GrammarRule; language: Language }) {
  const { t, language: uiLanguage } = useTranslation(talk);
  return (
    <details className="grammar-rule">
      <summary>📘 {t('ruleSummary', { title: rule.title })}</summary>
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
      </div>
    </details>
  );
}

/** A discussion question for the start of a lesson: chosen level, vocabulary topic and grammar point. */
export default function Discuss({ bank, ai }: { bank: Bank; ai: boolean }) {
  const { t, language: uiLanguage } = useTranslation(talk);
  const commonText = useTranslation(common);
  const names = useTranslation(learning);
  const settings = useSettings();
  const [choice, setChoice] = useState<Choice>(() => {
    const stored = load<Choice>('discuss:choice');
    // the first time, start from the student's own language and level (Settings)
    const first = settings.studying[0] ?? 'fr';
    const saved = stored
      ? { ...DEFAULT_CHOICE, ...stored }
      : {
          ...DEFAULT_CHOICE,
          language: first,
          level: settings.levels[first],
          topic: TOPICS[first][0] ?? '',
        };
    // the topic list no longer has "Other…": an own topic lives in its own field
    return saved.topic === CUSTOM ? { ...saved, topic: TOPICS[saved.language][0] ?? '' } : saved;
  });
  // a language taken out in Settings falls back to the first one still studied
  const language: Language = settings.studying.includes(choice.language)
    ? choice.language
    : (settings.studying[0] ?? 'fr');
  const [discussion, setDiscussion] = useState<Discussion | null>(() =>
    load<Discussion>('discuss:last')
  );
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  const update = (changes: Partial<Choice>) =>
    setChoice((previous) => {
      const next = { ...previous, ...changes };
      save('discuss:choice', next);
      return next;
    });
  const lessonTopics = [...new Set(bank.lessons.map((lesson) => lesson.topic).filter(Boolean))];
  // a topic of their own ("the TV series Dexter") wins over the list
  const ownTopic = choice.customTopic.trim();
  const topic = ownTopic || choice.topic;
  const grammar = choice.grammar === CUSTOM ? choice.customGrammar : choice.grammar;

  async function generate() {
    setState('loading');
    setError('');
    try {
      const next = normDiscussion(
        await api.discussion({
          language,
          level: choice.level,
          topic,
          grammar,
          explainIn: uiLanguage,
        })
      );
      if (!next) throw new ApiError(0, 'empty', t('noQuestion'));
      setDiscussion(next);
      save('discuss:last', next);
      setShowTranslation(false);
      setState('idle');
    } catch (failure) {
      setState('error');
      setError(failure instanceof ApiError ? failure.message : t('questionFailed'));
    }
  }

  return (
    <>
      <PageHead title={t('discussTitle')}>{t('discussIntro')}</PageHead>
      {!ai ? (
        <p className="empty">{commonText.t('needsClaude')}</p>
      ) : (
        <>
          <form
            className="discuss-form"
            onSubmit={(event) => {
              event.preventDefault();
              void generate();
            }}
          >
            <label className="discuss-field">
              <span>{t('language')}</span>
              <select
                value={language}
                onChange={(event) => {
                  const next = event.target.value as Language;
                  // the lists differ per language, so start them over
                  update({
                    language: next,
                    level: settings.levels[next],
                    topic: TOPICS[next][0] ?? '',
                    grammar: '',
                  });
                }}
              >
                {settings.studying.map((code) => (
                  <option key={code} value={code}>
                    {names.t(`name.${code}`)}
                  </option>
                ))}
              </select>
            </label>
            <div className="discuss-field">
              <span>{t('level')}</span>
              <div className="seg" role="group" aria-label={t('level')}>
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={choice.level === level}
                    onClick={() => update({ level })}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <TopicSelect
              label={t('vocabularyTopic')}
              options={TOPICS[language]}
              extra={{ label: t('fromLessons'), options: lessonTopics }}
              value={choice.topic}
              custom={choice.customTopic}
              allowCustom={false}
              dimmed={!!ownTopic}
              onChange={(value) => update({ topic: value })}
              onCustom={(value) => update({ customTopic: value })}
            />
            <div className="discuss-field discuss-own">
              <label htmlFor="discuss-own-topic">
                <span>{t('ownTopic')}</span>
              </label>
              <div className="discuss-own-input">
                <input
                  id="discuss-own-topic"
                  type="text"
                  value={choice.customTopic}
                  maxLength={120}
                  placeholder={t('ownTopicPlaceholder')}
                  onChange={(event) => update({ customTopic: event.target.value })}
                />
                {ownTopic && (
                  <button
                    type="button"
                    className="btn ghost"
                    aria-label={t('clearOwnTopic')}
                    title={t('clearOwnTopic')}
                    onClick={() => update({ customTopic: '' })}
                  >
                    ×
                  </button>
                )}
              </div>
              <small className="hint">{t('ownTopicHint')}</small>
            </div>
            <TopicSelect
              label={t('grammarTopic')}
              options={GRAMMAR[language]}
              noneLabel={t('any')}
              value={choice.grammar}
              custom={choice.customGrammar}
              onChange={(value) => update({ grammar: value })}
              onCustom={(value) => update({ customGrammar: value })}
            />
            <div className="row-actions">
              <button className="btn primary" type="submit" disabled={state === 'loading'}>
                {discussion ? t('anotherQuestion') : t('writeQuestion')}
              </button>
            </div>
          </form>

          {state === 'loading' && (
            <WaitingFact language={language}>{t('writingQuestion')}</WaitingFact>
          )}
          {state === 'error' && (
            <div className="note err">
              <p>{error}</p>
            </div>
          )}

          {discussion && state !== 'loading' && (
            <article className="discussion">
              <p className="discussion-question" lang={language}>
                {discussion.question} <Speak text={discussion.question} language={language} />
              </p>
              {discussion.ru &&
                (showTranslation ? (
                  <p className="discussion-ru" lang="ru">
                    {discussion.ru}
                  </p>
                ) : (
                  <button className="btn ghost flush" onClick={() => setShowTranslation(true)}>
                    {commonText.t('showTranslation')}
                  </button>
                ))}

              <div className="discussion-grid">
                {discussion.followUps.length > 0 && (
                  <section>
                    <h3>{t('keepGoing')}</h3>
                    <ul lang={language}>
                      {discussion.followUps.map((followUp) => (
                        <li key={followUp}>{followUp}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {discussion.starters.length > 0 && (
                  <section>
                    <h3>{t('startWith')}</h3>
                    <ul className="starters" lang={language}>
                      {discussion.starters.map((starter) => (
                        <li key={starter}>{starter}</li>
                      ))}
                    </ul>
                    {discussion.grammarTip && (
                      <p className="grammar-tip" lang={uiLanguage}>
                        {discussion.grammarTip}
                      </p>
                    )}
                  </section>
                )}
              </div>

              {discussion.grammarRule && (
                <GrammarRuleBox rule={discussion.grammarRule} language={language} />
              )}

              {discussion.vocabulary.length > 0 && (
                <section>
                  <h3>{t('usefulWords')}</h3>
                  <ul className="discussion-words">
                    {discussion.vocabulary.map((item) => (
                      <li key={item.word}>
                        <span className="fr" lang={language}>
                          {item.word}
                        </span>
                        <span className="ru" lang="ru">
                          {item.ru}
                        </span>
                        <Speak text={item.word} language={language} />
                        <Star
                          word={{
                            fr: item.word,
                            ru: item.ru,
                            tr: '',
                            kind: 'other',
                            added: false,
                            language,
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          )}
        </>
      )}
    </>
  );
}
