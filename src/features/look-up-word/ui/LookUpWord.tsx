import { type FormEvent, useRef, useState } from 'react';

import { type Language, useSettings } from '@/shared/config';
import { learning, useTranslation, wordActions } from '@/shared/i18n';
import { Button } from '@/shared/ui/controls';

import { cleanSelection, lookUp, menuPlace } from '../model/wordActions';

// A word or phrase typed by hand, one that isn't in any text, opened in the word menu.
const LookUpWord = () => {
  const { t } = useTranslation(wordActions);
  const names = useTranslation(learning);
  const { studying } = useSettings();
  const [typed, setTyped] = useState('');
  const [chosen, setChosen] = useState<Language | null>(null);
  const field = useRef<HTMLInputElement>(null);
  // a language dropped in Settings gives way to the first one learned
  const language = chosen && studying.includes(chosen) ? chosen : (studying[0] ?? 'fr');
  const word = cleanSelection(typed);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!word || !field.current) return;
    lookUp({
      text: word,
      // no sentence around it: the word itself is all Claude has to go on
      context: word,
      language,
      ...menuPlace(field.current.getBoundingClientRect()),
      source: null,
    });
  };

  return (
    <form className="look-up" onSubmit={submit}>
      <input
        ref={field}
        lang={language}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        aria-label={t('lookUpLabel')}
        placeholder={t('lookUpPlaceholder')}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {studying.length > 1 && (
        <select
          aria-label={t('lookUpLanguage')}
          value={language}
          onChange={(event) => {
            const value = event.target.value;
            setChosen(studying.find((candidate) => candidate === value) ?? null);
          }}
        >
          {studying.map((candidate) => (
            <option key={candidate} value={candidate}>
              {names.t(`name.${candidate}`)}
            </option>
          ))}
        </select>
      )}
      <Button type="submit" variant="primary" disabled={!word}>
        {t('lookUp')}
      </Button>
    </form>
  );
};

export default LookUpWord;
