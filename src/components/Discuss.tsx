import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { common, learning } from '../i18n/messages/common';
import { talk } from '../i18n/messages/talk';
import { api, ApiError } from '../lib/api';
import type { Bank } from '../lib/bank';
import { normalizeDiscussion } from '../lib/parse';
import { LEVELS, useSettings } from '../lib/settings';
import { asFields, load, loadChecked, save } from '../lib/storage';
import type { Discussion, Language } from '../lib/types';
import { asLanguage } from '../lib/types';
import { shownTopic } from '../lib/util';
import GrammarRuleBox from './GrammarRuleBox';
import PageHead from './PageHead';
import Speak from './Speak';
import Star from './Star';
import WaitingFact from './WaitingFact';

const CUSTOM = '__custom';
// the student's own topic; the server cuts it at the same length (api/discussion.ts)
const MAX_TOPIC_LENGTH = 120;

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
  es: [
    'La familia',
    'Los amigos',
    'El trabajo',
    'Los estudios',
    'Los viajes',
    'La comida',
    'La vivienda',
    'La ciudad',
    'El tiempo libre',
    'El deporte',
    'La salud',
    'Las vacaciones',
    'Las compras',
    'La tecnología',
    'El medio ambiente',
    'La cultura y el arte',
    'Las fiestas',
    'La infancia',
    'Los planes',
    'España y Latinoamérica',
  ],
  pt: [
    'A família',
    'Os amigos',
    'O trabalho',
    'Os estudos',
    'As viagens',
    'A comida',
    'A casa',
    'A cidade',
    'Os tempos livres',
    'O desporto',
    'A saúde',
    'As férias',
    'As compras',
    'A tecnologia',
    'O ambiente',
    'A cultura e a arte',
    'As festas',
    'A infância',
    'Os planos',
    'Portugal, o Brasil e a lusofonia',
  ],
  it: [
    'La famiglia',
    'Gli amici',
    'Il lavoro',
    'Lo studio',
    'I viaggi',
    'Il cibo',
    'La casa',
    'La città',
    'Il tempo libero',
    'Lo sport',
    'La salute',
    'Le vacanze',
    'Gli acquisti',
    'La tecnologia',
    'L’ambiente',
    'La cultura e l’arte',
    'Le feste',
    'L’infanzia',
    'I progetti',
    'L’Italia e le sue regioni',
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
  es: [
    'El presente',
    'Ser y estar',
    'El pretérito indefinido',
    'El pretérito imperfecto',
    'Indefinido o imperfecto',
    'El pretérito perfecto',
    'Ir a + infinitivo',
    'El futuro simple',
    'El condicional',
    'El subjuntivo presente',
    'El imperativo',
    'Los verbos reflexivos',
    'Por y para',
    'Los pronombres de objeto',
    'Gustar y verbos parecidos',
    'Comparativos y superlativos',
  ],
  pt: [
    'O presente',
    'Ser e estar',
    'O pretérito perfeito',
    'O pretérito imperfeito',
    'Perfeito ou imperfeito',
    'Ir + infinitivo',
    'O futuro',
    'O condicional',
    'O presente do conjuntivo',
    'O infinitivo pessoal',
    'O imperativo',
    'Os verbos reflexos',
    'Por e para',
    'Os pronomes pessoais',
    'Comparativos e superlativos',
  ],
  it: [
    'Il presente',
    'Il passato prossimo',
    'Essere o avere',
    'L’imperfetto',
    'Passato prossimo o imperfetto',
    'Il futuro semplice',
    'Il condizionale',
    'Il congiuntivo presente',
    'L’imperativo',
    'I verbi riflessivi',
    'Le preposizioni articolate',
    'I pronomi diretti e indiretti',
    'Ci e ne',
    'Comparativi e superlativi',
    'I pronomi relativi',
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

// A topic or grammar dropdown with an "Other…" choice that opens a text field.
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
  // more choices in their own group, e.g. the topics of the lessons
  extra?: { label: string; options: string[] };
  value: string;
  custom: string;
  noneLabel?: string;
  // offer "Other…" with a text field (the vocabulary topic has its own field instead)
  allowCustom?: boolean;
  // shown greyed out: something else (the student's own topic) is used instead
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
          maxLength={MAX_TOPIC_LENGTH}
          placeholder={t('typeYourOwn')}
          onChange={(event) => onCustom(event.target.value)}
        />
      )}
    </label>
  );
}

/** A discussion question for the start of a lesson: chosen level, vocabulary topic and grammar
    point. Embedded, it leaves out the page heading: lesson mode shows it in a card of its own. */
export default function Discuss({
  bank,
  hasClaude,
  embedded = false,
}: {
  bank: Bank;
  hasClaude: boolean;
  embedded?: boolean;
}) {
  const { t, language: uiLanguage } = useTranslation(talk);
  const commonText = useTranslation(common);
  const names = useTranslation(learning);
  const settings = useSettings();
  const [choice, setChoice] = useState<Choice>(() => {
    const fields = asFields(load<unknown>('discuss:choice'), {
      level: 'string',
      topic: 'string',
      customTopic: 'string',
      grammar: 'string',
      customGrammar: 'string',
    });
    const stored: Choice | null = fields && {
      ...fields,
      language: asLanguage((load<unknown>('discuss:choice') as { language?: unknown }).language),
    };
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
    loadChecked('discuss:last', normalizeDiscussion)
  );
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  const update = (changes: Partial<Choice>) => {
    const next = { ...choice, ...changes };
    setChoice(next);
    save('discuss:choice', next);
  };
  const lessonTopics = [
    ...new Set(bank.lessons.map((lesson) => shownTopic(lesson.topic, uiLanguage)).filter(Boolean)),
  ];
  // a topic of their own ("the TV series Dexter") wins over the list
  const ownTopic = choice.customTopic.trim();
  // a saved choice can belong to another language (it was taken out in Settings): fall back
  const listTopic =
    TOPICS[language].includes(choice.topic) || lessonTopics.includes(choice.topic)
      ? choice.topic
      : (TOPICS[language][0] ?? '');
  const listGrammar =
    choice.grammar === CUSTOM || GRAMMAR[language].includes(choice.grammar) ? choice.grammar : '';
  const topic = ownTopic || listTopic;
  const grammar = listGrammar === CUSTOM ? choice.customGrammar : listGrammar;

  async function generate() {
    setState('loading');
    setError('');
    try {
      const next = normalizeDiscussion(
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
      {!embedded && (
        <PageHead guide="discuss" title={t('discussTitle')}>
          {t('discussIntro')}
        </PageHead>
      )}
      {!hasClaude ? (
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
              value={listTopic}
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
                  maxLength={MAX_TOPIC_LENGTH}
                  placeholder={t('ownTopicPlaceholder')}
                  onChange={(event) => update({ customTopic: event.target.value })}
                />
                {ownTopic && (
                  <button
                    type="button"
                    className="btn ghost"
                    aria-label={t('clearOwnTopic')}
                    data-tooltip={t('clearOwnTopic')}
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
              value={listGrammar}
              custom={choice.customGrammar}
              onChange={(value) => update({ grammar: value })}
              onCustom={(value) => update({ customGrammar: value })}
            />
            <div className="row-actions">
              <button className="btn primary" type="submit" disabled={state === 'loading'}>
                {discussion ? t('askQuestion') : t('writeQuestion')}
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
                  <button
                    type="button"
                    className="btn ghost flush"
                    onClick={() => setShowTranslation(true)}
                  >
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
                <GrammarRuleBox
                  rule={discussion.grammarRule}
                  language={language}
                  label={`📘 ${t('ruleSummary', { title: discussion.grammarRule.title })}`}
                />
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
