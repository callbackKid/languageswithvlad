import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Bank } from '../lib/bank';
import { normDiscussion } from '../lib/parse';
import { load, save } from '../lib/storage';
import { LANGUAGES, type Discussion, type Language } from '../lib/types';
import { useTranslation } from '../i18n/core';
import { common, learning } from '../i18n/messages/common';
import { talk } from '../i18n/messages/talk';
import PageHead from './PageHead';
import Speak from './Speak';
import Star from './Star';
import WaitingFact from './WaitingFact';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
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
  onChange: (value: string) => void;
  onCustom: (value: string) => void;
}) {
  const { t } = useTranslation(talk);
  return (
    <label className="discuss-field">
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
        <option value={CUSTOM}>{t('other')}</option>
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

/** A discussion question for the start of a lesson: chosen level, vocabulary topic and grammar point. */
export default function Discuss({ bank, ai }: { bank: Bank; ai: boolean }) {
  const { t } = useTranslation(talk);
  const commonText = useTranslation(common);
  const names = useTranslation(learning);
  const [choice, setChoice] = useState<Choice>(() => ({
    ...DEFAULT_CHOICE,
    ...load<Choice>('discuss:choice'),
  }));
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
  const topic = choice.topic === CUSTOM ? choice.customTopic : choice.topic;
  const grammar = choice.grammar === CUSTOM ? choice.customGrammar : choice.grammar;

  async function generate() {
    setState('loading');
    setError('');
    try {
      const next = normDiscussion(
        await api.discussion({ language: choice.language, level: choice.level, topic, grammar })
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

  const language = choice.language;
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
                  update({ language: next, topic: TOPICS[next][0] ?? '', grammar: '' });
                }}
              >
                {LANGUAGES.map((code) => (
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
              onChange={(value) => update({ topic: value })}
              onCustom={(value) => update({ customTopic: value })}
            />
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
                      <p className="grammar-tip" lang="ru">
                        {discussion.grammarTip}
                      </p>
                    )}
                  </section>
                )}
              </div>

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
