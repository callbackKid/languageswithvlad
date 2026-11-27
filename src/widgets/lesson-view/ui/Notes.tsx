import { useEffect, useRef, useState } from 'react';

import { common, useTranslation } from '@/shared/i18n';
import { loadText, save } from '@/shared/lib/storage';
import { Textarea } from '@/shared/ui/controls';

import styles from './Notes.module.css';

// A notepad, saved on this device as the student types.
const Notes = ({ storageKey }: { storageKey: string }) => {
  const { t } = useTranslation(common);
  const [text, setText] = useState(() => loadText(storageKey) || '');
  const [status, setStatus] = useState<'' | 'saving' | 'saved'>('');
  const timer = useRef<number>();
  const pending = useRef<string | null>(null);

  // Save anything still pending when the student switches lesson or tab.
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      if (pending.current !== null) save(storageKey, pending.current);
    },
    [storageKey]
  );

  return (
    <>
      <Textarea
        className="notes"
        value={text}
        aria-label={t('notesLabel')}
        placeholder={t('notesPlaceholder')}
        onChange={(event) => {
          const value = event.target.value;
          setText(value);
          setStatus('saving');
          pending.current = value;
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            save(storageKey, value);
            pending.current = null;
            setStatus('saved');
          }, 500);
        }}
      />
      <div className={styles['notes-status']} role="status">
        {status === 'saving' ? t('saving') : status === 'saved' ? t('savedHere') : ''}
      </div>
    </>
  );
};

export default Notes;
