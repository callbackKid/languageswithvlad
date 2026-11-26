import { type ReactNode, useState } from 'react';

import {
  normalizeWriting,
  normalizeWritingCheck,
  type Writing,
  type WritingCheck,
} from '@/entities/homework';
import { api, ApiError } from '@/shared/api';
import { getSettings, type Language } from '@/shared/config';
import {
  common,
  getUiLanguage,
  homework as homeworkText,
  translator,
  useTranslation,
} from '@/shared/i18n';
import { loadChecked, save } from '@/shared/lib/storage';
import { Button } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import WaitingFact from '@/shared/ui/WaitingFact';

// The corrected text with every fix marked, in order.
function markFixes(corrected: string, check: WritingCheck): ReactNode[] {
  const parts: ReactNode[] = [];
  let position = 0;
  check.mistakes.forEach((mistake, index) => {
    const at = mistake.right ? corrected.indexOf(mistake.right, position) : -1;
    if (at < 0) return;
    parts.push(corrected.slice(position, at), <mark key={index}>{mistake.right}</mark>);
    position = at + mistake.right.length;
  });
  parts.push(corrected.slice(position));
  return parts;
}

// What Claude said about an answer: the corrected text, each mistake with its rule, a comment.
export function WritingResult({ check, language }: { check: WritingCheck; language: Language }) {
  const { t } = useTranslation(homeworkText);
  return (
    <div className="writing-result">
      <h3>{t('corrected')}</h3>
      <p className="writing-corrected" lang={language}>
        {markFixes(check.corrected, check)}
      </p>
      {check.mistakes.length ? (
        <>
          <h3>{t('mistakesTitle', { count: check.mistakes.length })}</h3>
          <ul className="writing-mistakes">
            {check.mistakes.map((mistake, index) => (
              <li key={index}>
                <span lang={language}>
                  {mistake.wrong && <del>{mistake.wrong}</del>}
                  {mistake.wrong && mistake.right && ' → '}
                  {mistake.right && <ins>{mistake.right}</ins>}
                </span>
                {mistake.why && <span className="why">{mistake.why}</span>}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="feedback ok">{t('noMistakes')}</p>
      )}
      {check.comment && <p className="writing-comment">{check.comment}</p>}
    </div>
  );
}

/** A written homework task ("5 phrases au passé composé", "traduire : …"): the student writes,
    Claude corrects. The draft and the check are kept on this device under storageKey. */
export default function WritingTask({
  task,
  language,
  storageKey,
  hasClaude,
  onClose,
  onChecked,
}: {
  task: string;
  language: Language;
  storageKey: string;
  hasClaude: boolean;
  onClose: () => void;
  onChecked?: () => void;
}) {
  const { t } = useTranslation(homeworkText);
  const commonText = useTranslation(common);
  const [writing, setWriting] = useState<Writing>(
    () => loadChecked(storageKey, normalizeWriting) ?? { task, text: '' }
  );
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const keep = (next: Writing) => {
    setWriting(next);
    save(storageKey, next);
  };
  async function check() {
    const text = writing.text.trim();
    if (!text) return;
    setChecking(true);
    setError('');
    try {
      const result = normalizeWritingCheck(
        await api.checkWriting({
          task,
          text,
          level: getSettings().levels[language],
          explainIn: getUiLanguage(),
        })
      );
      if (!result) throw new Error('empty');
      // read again: the student may have typed on while Claude was reading
      const latest = loadChecked(storageKey, normalizeWriting) ?? writing;
      keep({ ...latest, check: result, checkedText: text, checkedAt: Date.now() });
      onChecked?.();
    } catch (failure) {
      // read at the moment of failure, so a new interface language is used
      setError(
        failure instanceof ApiError ? failure.message : translator(homeworkText).t('checkFailed')
      );
    } finally {
      setChecking(false);
    }
  }

  const edited = !!writing.check && writing.checkedText !== writing.text.trim();
  return (
    <div className="ex writing-task">
      <ExerciseHead title={task} onClose={onClose} closeLabel={t('backToHomework')} />
      <p className="hint">{t('writeHint')}</p>
      <textarea
        className="notes writing-text"
        lang={language}
        value={writing.text}
        aria-label={t('yourAnswer')}
        // the phone must not fix the mistakes Claude is about to check
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => keep({ ...writing, text: event.target.value })}
      />
      <div className="row-actions">
        <Button
          variant="primary"
          disabled={checking || !hasClaude || !writing.text.trim()}
          data-tooltip={hasClaude ? undefined : commonText.t('needsClaude')}
          onClick={() => void check()}
        >
          {writing.check ? t('checkAgain') : t('check')}
        </Button>
      </div>
      {checking && <WaitingFact language={language}>{t('checking')}</WaitingFact>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {writing.check && !checking && (
        <>
          {edited && <p className="hint">{t('editedSinceCheck')}</p>}
          <WritingResult check={writing.check} language={language} />
        </>
      )}
    </div>
  );
}
