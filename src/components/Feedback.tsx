import { type ClipboardEvent, type DragEvent, useEffect, useRef, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { talk } from '../i18n/messages/talk';
import { api, ApiError, type FeedbackKind } from '../lib/api';
import { type ImagePayload, shrinkImage } from '../lib/image';
import { getSettings, isDark } from '../lib/settings';
import { load, save } from '../lib/storage';

const MAX_PICTURES = 3;
// long side in pixels: a screenshot stays readable and three of them fit the upload limit
const MAX_SIDE = 1600;
const DRAFT_KEY = 'feedback:draft';

const KINDS: FeedbackKind[] = ['bug', 'idea', 'other'];

interface Draft {
  kind: FeedbackKind;
  message: string;
  contact: string;
}
const EMPTY_DRAFT: Draft = { kind: 'bug', message: '', contact: '' };

interface Picture extends ImagePayload {
  preview: string;
}

/** Where it happened, so the teacher doesn't have to ask. */
function browserLine(): string {
  const theme = isDark() ? 'dark' : 'light';
  return `${navigator.userAgent.slice(0, 200)} · window ${window.innerWidth}×${window.innerHeight} · ${theme} theme`;
}

/** A "Feedback" button that opens a form: report a bug, suggest a change or write anything, with screenshots. Goes to the teacher's Telegram. */
export default function Feedback({ docTitle }: { docTitle: string }) {
  const { t } = useTranslation(talk);
  const { t: tc } = useTranslation(common);
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY_DRAFT,
    // the name from Settings, until the student writes another contact here
    contact: getSettings().name,
    ...load<Draft>(DRAFT_KEY),
  }));
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const update = (changes: Partial<Draft>) => {
    const next = { ...draft, ...changes };
    setDraft(next);
    save(DRAFT_KEY, next);
  };

  // previews are object URLs; let them go when the form is done with them
  const previews = useRef<string[]>([]);
  previews.current = pictures.map((picture) => picture.preview);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith('image/'));
    const room = MAX_PICTURES - pictures.length;
    if (!images.length) return;
    if (room <= 0) {
      setError(t('tooManyPictures', { count: MAX_PICTURES }));
      return;
    }
    setError('');
    try {
      const added = await Promise.all(
        images.slice(0, room).map(async (file) => ({
          ...(await shrinkImage(file, MAX_SIDE)),
          preview: URL.createObjectURL(file),
        }))
      );
      setPictures((previous) => [...previous, ...added].slice(0, MAX_PICTURES));
    } catch {
      setError(t('pictureFailed'));
    }
  }

  function removePicture(index: number) {
    setPictures((previous) => {
      const removed = previous[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return previous.filter((_picture, position) => position !== index);
    });
  }

  function open() {
    if (state === 'sent') setState('idle');
    dialog.current?.showModal();
  }
  const close = () => dialog.current?.close();

  async function send() {
    setState('sending');
    setError('');
    try {
      await api.feedback({
        kind: draft.kind,
        message: draft.message,
        contact: draft.contact,
        images: pictures.map(({ mediaType, data }) => ({ mediaType, data })),
        page: window.location.pathname,
        docTitle,
        browser: browserLine(),
        sentAt: new Date().toLocaleString('en-GB', { timeZoneName: 'short' }),
      });
      pictures.forEach((picture) => URL.revokeObjectURL(picture.preview));
      setPictures([]);
      // the contact stays for next time; the message is done
      update({ message: '' });
      setState('sent');
    } catch (failure) {
      setState('error');
      setError(failure instanceof ApiError ? failure.message : t('sendFailed'));
    }
  }

  // a screenshot copied to the clipboard can be pasted straight into the form
  const onPaste = (event: ClipboardEvent) => {
    const files = [...event.clipboardData.files];
    if (files.some((file) => file.type.startsWith('image/'))) {
      event.preventDefault();
      void addFiles(files);
    }
  };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    void addFiles([...event.dataTransfer.files]);
  };

  return (
    <>
      <button type="button" className="btn ghost" onClick={open}>
        {t('feedback')}
      </button>
      <dialog
        ref={dialog}
        className="report-dialog"
        aria-labelledby="report-title"
        onPaste={onPaste}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        // a click on the dimmed area around the form closes it
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
      >
        {state === 'sent' ? (
          <div className="report-body">
            <h2 id="report-title">{t('thanks')}</h2>
            <p>{t('sent')}</p>
            <div className="row-actions">
              <button type="button" className="btn primary" onClick={close}>
                {tc('close')}
              </button>
              <button type="button" className="btn ghost" onClick={() => setState('idle')}>
                {t('writeAnother')}
              </button>
            </div>
          </div>
        ) : (
          <form
            className="report-body"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <h2 id="report-title">{t('feedback')}</h2>
            <p className="hint">{t('feedbackIntro')}</p>

            <div className="seg report-kinds" role="group" aria-label={t('whatAbout')}>
              {KINDS.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  aria-pressed={draft.kind === entry}
                  onClick={() => update({ kind: entry })}
                >
                  {t(`kind.${entry}`)}
                </button>
              ))}
            </div>

            <label className="form-field">
              <span>{t('message')}</span>
              <textarea
                required
                rows={5}
                maxLength={3000}
                value={draft.message}
                placeholder={t(`placeholder.${draft.kind}`)}
                onChange={(event) => update({ message: event.target.value })}
              />
            </label>

            <div className="form-field">
              <span>{t('pictures')}</span>
              <div className="report-pictures">
                {pictures.map((picture, index) => (
                  <figure key={picture.preview}>
                    <img src={picture.preview} alt={t('attachedPicture', { count: index + 1 })} />
                    <button
                      type="button"
                      className="report-remove"
                      aria-label={t('removePicture', { count: index + 1 })}
                      onClick={() => removePicture(index)}
                    >
                      ×
                    </button>
                  </figure>
                ))}
                {pictures.length < MAX_PICTURES && (
                  <label className="btn report-add">
                    {t('addPicture')}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(event) => {
                        void addFiles([...(event.target.files ?? [])]);
                        event.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
              <small className="hint">{t('picturesHint', { count: MAX_PICTURES })}</small>
            </div>

            <label className="form-field">
              <span>{t('contact')}</span>
              <input
                type="text"
                maxLength={200}
                value={draft.contact}
                placeholder={t('contactPlaceholder')}
                onChange={(event) => update({ contact: event.target.value })}
              />
            </label>

            <p className="hint report-privacy">{t('privacy')}</p>

            {error && (
              <div className="note err" role="alert">
                <p>{error}</p>
              </div>
            )}

            <div className="row-actions">
              <button
                type="submit"
                className="btn primary"
                disabled={state === 'sending' || !draft.message.trim()}
              >
                {state === 'sending' ? t('sending') : t('send')}
              </button>
              <button type="button" className="btn ghost" onClick={close}>
                {tc('cancel')}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
