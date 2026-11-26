import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { type Lesson } from '@/entities/lesson';
import { normalizeWordCard, type WordCard } from '@/entities/word';
import { VerbsTab } from '@/features/conjugate-verb';
import {
  asLookUp,
  CARD_EVENT,
  type CardFound,
  cardWord,
  cleanSelection,
  docLine,
  learnedLanguage,
  LOOK_UP_EVENT,
  type LookUp,
  menuPlace,
  readWordCard,
  saveWordCard,
  sentenceAround,
} from '@/features/look-up-word';
import { Star } from '@/features/star-word';
import { api, ApiError } from '@/shared/api';
import { TENSES_BY_LANGUAGE, translationLanguage, useTranslationLanguage } from '@/shared/config';
import { common, translator, useTranslation, wordActions } from '@/shared/i18n';
import { Button, IconButton } from '@/shared/ui/controls';
import Speak from '@/shared/ui/Speak';
import WaitingFact from '@/shared/ui/WaitingFact';

/** Where the menu never opens on a selection: exercises (it would give the answers away), form
    fields, places marked data-no-word-actions (translations, which may be in a language being
    learned too), and the menu itself. */
const SKIPPED =
  '.ex, input, textarea, select, [contenteditable], [data-no-word-actions], .word-actions';
// The element whose text holds the sentence around a selection.
const BLOCK = 'p, li, td, th, dd, dt, h1, h2, h3, h4, blockquote, pre, label, div';
// On a touch screen the selection is adjusted with handles: the menu waits until it rests this long.
const TOUCH_PAUSE_MS = 600;

const VIEWS = ['translate', 'define', 'examples', 'conjugate'] as const;
type View = (typeof VIEWS)[number];

// The selection on the page, when it is text in a language being learned outside the skipped places.
function pickedNow(): LookUp | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
  const text = cleanSelection(selection.toString());
  if (!text) return null;
  const range = selection.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const element = node instanceof Element ? node : node.parentElement;
  if (!element || element.closest(SKIPPED)) return null;
  // the interface's own language sits on <html>; only text marked with its language counts
  const marked = element.closest('[lang]');
  if (!marked || marked === document.documentElement) return null;
  const language = learnedLanguage(marked.getAttribute('lang'));
  if (!language) return null;
  const block = element.closest(BLOCK) ?? marked;
  const paragraph = (block.textContent ?? '').replace(/\s+/g, ' ');
  return {
    text,
    context: sentenceAround(paragraph, text),
    language,
    ...menuPlace(range.getBoundingClientRect()),
    source: element.closest('[data-word-source]')?.getAttribute('data-word-source') ?? null,
  };
}

/** The menu on a word or phrase selected anywhere in the app, in text marked with a language being
    learned: its translation in the sentence, a definition, examples and verb tables (one request
    to Claude for all of them, kept on the device), 🔊, ☆, and, on a lesson's pages, a line added
    under that lesson in the document. */
export default function WordActions({
  hasClaude,
  docId,
  lesson,
  canWrite,
}: {
  hasClaude: boolean;
  docId: string;
  // the lesson a looked-up word can be added to: the open lesson, or the newest one in lesson mode
  lesson: Lesson | null;
  canWrite: boolean;
}) {
  const { t, rich } = useTranslation(wordActions);
  const commonText = useTranslation(common);
  const translationOf = useTranslationLanguage();
  const [picked, setPicked] = useState<LookUp | null>(null);
  const [card, setCard] = useState<WordCard | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [addError, setAddError] = useState('');
  const menu = useRef<HTMLDivElement>(null);
  // counts the selections, so an answer that arrives after a newer one is dropped
  const pickCount = useRef(0);

  useEffect(() => {
    let pointer = 'mouse';
    let timer = 0;
    const inMenu = (target: EventTarget | null) =>
      target instanceof Node && !!menu.current?.contains(target);
    const show = (next: LookUp | null) => {
      if (!next) return;
      pickCount.current += 1;
      setPicked(next);
      setCard(readWordCard(next.text, next.context, translationLanguage(next.language)));
      setView(null);
      setState('idle');
      setError('');
      setAdding('idle');
      setAddError('');
    };
    const open = () => show(pickedNow());
    const onLookUp = (event: Event) =>
      show(asLookUp(event instanceof CustomEvent ? event.detail : null));
    const onPointerDown = (event: PointerEvent) => {
      pointer = event.pointerType;
      if (!inMenu(event.target)) setPicked(null);
    };
    const onMouseUp = (event: MouseEvent) => {
      // after the browser has finished the selection
      if (pointer === 'mouse' && !inMenu(event.target)) timer = window.setTimeout(open, 0);
    };
    const onSelectionChange = () => {
      if (pointer === 'mouse') return;
      window.clearTimeout(timer);
      timer = window.setTimeout(open, TOUCH_PAUSE_MS);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPicked(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener(LOOK_UP_EVENT, onLookUp);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(LOOK_UP_EVENT, onLookUp);
    };
  }, []);

  // the place on a wide screen; on a phone the stylesheet puts the menu at the bottom instead
  useLayoutEffect(() => {
    if (!picked || !menu.current) return;
    menu.current.style.setProperty('--word-top', `${picked.top}px`);
    menu.current.style.setProperty('--word-left', `${picked.left}px`);
  }, [picked]);

  // Tells the part of the page the word came from that it now has a card (the Text page lists them).
  function report(found: WordCard) {
    if (!picked?.source) return;
    const detail: CardFound = { card: found, source: picked.source };
    window.dispatchEvent(new CustomEvent(CARD_EVENT, { detail }));
  }

  // The card for the selection: the saved one, or Claude's answer; null while it fails.
  async function cardNow(): Promise<WordCard | null> {
    if (card) {
      report(card);
      return card;
    }
    if (!picked) return null;
    const pick = pickCount.current;
    setState('loading');
    setError('');
    // once, so the request and the key it is saved under always agree
    const translation = translationLanguage(picked.language);
    try {
      const answer = normalizeWordCard(
        await api.word(picked.text, picked.context, translation),
        picked.text
      );
      if (!answer) throw new Error('empty');
      saveWordCard(picked.text, picked.context, answer, translation);
      if (pick !== pickCount.current) return null;
      setCard(answer);
      setState('idle');
      report(answer);
      return answer;
    } catch (failure) {
      if (pick !== pickCount.current) return null;
      setState('error');
      // read at the moment of failure, so a new interface language is used
      setError(failure instanceof ApiError ? failure.message : translator(wordActions).t('failed'));
      return null;
    }
  }

  function choose(next: View) {
    setView(next);
    void cardNow();
  }

  async function addToLesson() {
    if (!card || !lesson) return;
    setAdding('saving');
    setAddError('');
    try {
      await api.append(docId, docLine(card), lesson.key);
      setAdding('done');
      // the app syncs: the word joins the lesson's exercises
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (failure) {
      setAdding('error');
      setAddError(
        failure instanceof ApiError ? failure.message : translator(common).t('addFailed')
      );
    }
  }

  if (!picked) return null;
  const { language } = picked;
  const hasTables = Object.hasOwn(TENSES_BY_LANGUAGE, language);
  const shownViews = VIEWS.filter((candidate) => candidate !== 'conjugate' || hasTables);
  const word = (chunk: ReactNode) => <b lang={language}>{chunk}</b>;

  // rendered at the top of App, outside any positioned element, so its place is the page's
  return (
    <div
      ref={menu}
      className="word-actions"
      role="dialog"
      aria-label={t('dialogLabel', { word: picked.text })}
    >
      <div className="word-actions-head">
        <b className="word-actions-word" lang={language}>
          {picked.text}
        </b>
        <Speak text={picked.text} language={language} />
        {card && <Star word={cardWord(card)} />}
        <IconButton label={commonText.t('close')} onClick={() => setPicked(null)}>
          ×
        </IconButton>
      </div>

      {hasClaude ? (
        <div className="seg word-actions-views" role="group" aria-label={t('actionsLabel')}>
          {shownViews.map((candidate) => (
            <Button
              variant="unstyled"
              key={candidate}
              aria-pressed={view === candidate}
              onClick={() => choose(candidate)}
            >
              {t(candidate)}
            </Button>
          ))}
        </div>
      ) : (
        <p className="hint">{commonText.t('needsClaude')}</p>
      )}

      {state === 'loading' && (
        <WaitingFact language={language}>
          {rich('asking', { b: word }, { word: picked.text })}
        </WaitingFact>
      )}
      {state === 'error' && (
        <div className="note err" role="alert">
          <p>{error}</p>
          <Button onClick={() => void cardNow()}>{commonText.t('tryAgain')}</Button>
        </div>
      )}

      {card && view && (
        <div className="word-actions-body">
          {view === 'translate' && (
            <>
              <p className="word-actions-ru" lang={translationOf(card.language)}>
                {card.ru}
              </p>
              {card.base && card.base !== card.fr && (
                <p className="hint">{rich('dictionaryForm', { b: word }, { base: card.base })}</p>
              )}
              {card.tense && (
                <p className="hint" lang={language}>
                  {card.tense}
                </p>
              )}
              {card.explanation && <p lang={translationOf(card.language)}>{card.explanation}</p>}
            </>
          )}
          {view === 'define' && (
            <>
              <p lang={language}>{card.definition || '—'}</p>
              {card.definitionRu && (
                <p className="hint" lang={translationOf(card.language)}>
                  {card.definitionRu}
                </p>
              )}
            </>
          )}
          {view === 'examples' &&
            (card.examples.length ? (
              <ul className="word-actions-examples">
                {card.examples.map((example) => (
                  <li key={example.text}>
                    <span lang={language}>{example.text}</span>
                    <Speak text={example.text} language={language} />
                    <span className="ru" lang={translationOf(card.language)}>
                      {example.ru}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            ))}
          {view === 'conjugate' &&
            (card.kind === 'verb' ? (
              <VerbsTab
                verbs={[{ inf: card.base || card.fr, ru: card.baseRu, language }]}
                hasClaude={hasClaude}
                waiting={false}
                openFirst
              />
            ) : (
              <p className="hint">{t('notAVerb', { word: card.base || card.fr })}</p>
            ))}
        </div>
      )}

      {card && lesson && (
        <div className="row-actions word-actions-add">
          {canWrite ? (
            <>
              <Button
                disabled={adding === 'saving' || adding === 'done'}
                onClick={() => void addToLesson()}
              >
                {adding === 'saving'
                  ? commonText.t('adding')
                  : adding === 'done'
                    ? commonText.t('added')
                    : t('addToLesson', { n: lesson.n })}
              </Button>
              {adding === 'done' && (
                <span className="hint" role="status">
                  {t('addedToLesson', { n: lesson.n })}
                </span>
              )}
              {adding === 'error' && (
                <span className="hint err" role="alert">
                  {addError}
                </span>
              )}
            </>
          ) : (
            <p className="hint">{commonText.t('docWriterMissing')}</p>
          )}
        </div>
      )}
    </div>
  );
}
