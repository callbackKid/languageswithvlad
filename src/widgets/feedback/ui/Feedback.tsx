import { type ClipboardEvent, type DragEvent, useEffect, useRef, useState } from 'react';

import { api, ApiError, type FeedbackKind } from '@/shared/api';
import { getSettings, isDark } from '@/shared/config';
import { common, talk, useTranslation } from '@/shared/i18n';
import { type ImagePayload, shrinkImage } from '@/shared/lib/image';
import { load, save } from '@/shared/lib/storage';
import { Button, IconButton, Input, Textarea } from '@/shared/ui/controls';

const MAX_PICTURES = 3;
// the server cuts the message and the contact at the same lengths (api/feedback.ts)
const MAX_MESSAGE_LENGTH = 3000;
const MAX_CONTACT_LENGTH = 200;
// a user agent is cut here: the server keeps a little more (api/feedback.ts)
const MAX_BROWSER_LENGTH = 200;
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
// the unsent message kept on this device; only its usable fields
const asDraft = (raw: unknown): Partial<Draft> => {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const kind = KINDS.find((known) => known === data.kind);
  return {
    ...(kind && { kind }),
    ...(typeof data.message === 'string' && { message: data.message }),
    ...(typeof data.contact === 'string' && { contact: data.contact }),
  };
};

interface Picture extends ImagePayload {
  preview: string;
}

// Where it happened, so the teacher doesn't have to ask.
const browserLine = (): string => {
  const theme = isDark() ? 'dark' : 'light';
  return `${navigator.userAgent.slice(0, MAX_BROWSER_LENGTH)} · window ${window.innerWidth}×${window.innerHeight} · ${theme} theme`;
};

// A "Feedback" button that opens a form: report a bug, suggest a change or write anything, with screenshots. Goes to the teacher's Telegram.
const Feedback = ({ docTitle }: { docTitle: string }) => {
  const { t } = useTranslation(talk);
  const { t: tc } = useTranslation(common);
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY_DRAFT,
    // the name from Settings, until the student writes another contact here
    contact: getSettings().name,
    ...asDraft(load<unknown>(DRAFT_KEY)),
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

  const addFiles = async (files: File[]) => {
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
  };

  const removePicture = (index: number) => {
    const removed = pictures[index];
    if (removed) URL.revokeObjectURL(removed.preview);
    setPictures((previous) => previous.filter((_picture, position) => position !== index));
  };

  const open = () => {
    if (state === 'sent') setState('idle');
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  const send = async () => {
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
  };

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
      <Button variant="ghost" onClick={open}>
        {t('feedback')}
      </Button>
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
              <Button variant="primary" onClick={close}>
                {tc('close')}
              </Button>
              <Button variant="ghost" onClick={() => setState('idle')}>
                {t('writeAnother')}
              </Button>
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
                <Button
                  variant="unstyled"
                  key={entry}
                  aria-pressed={draft.kind === entry}
                  onClick={() => update({ kind: entry })}
                >
                  {t(`kind.${entry}`)}
                </Button>
              ))}
            </div>

            <label className="form-field">
              <span>{t('message')}</span>
              <Textarea
                required
                rows={5}
                maxLength={MAX_MESSAGE_LENGTH}
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
                    <IconButton
                      className="report-remove"
                      label={t('removePicture', { count: index + 1 })}
                      onClick={() => removePicture(index)}
                    >
                      ×
                    </IconButton>
                  </figure>
                ))}
                {pictures.length < MAX_PICTURES && (
                  <label className="btn report-add">
                    {t('addPicture')}
                    <Input
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
              <Input
                type="text"
                maxLength={MAX_CONTACT_LENGTH}
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
              <Button
                type="submit"
                variant="primary"
                disabled={state === 'sending' || !draft.message.trim()}
              >
                {state === 'sending' ? t('sending') : t('send')}
              </Button>
              <Button variant="ghost" onClick={close}>
                {tc('cancel')}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
};

export default Feedback;
