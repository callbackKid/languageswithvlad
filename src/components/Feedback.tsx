import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from 'react';
import { api, ApiError, type FeedbackKind } from '../lib/api';
import { shrinkImage, type ImagePayload } from '../lib/image';
import { load, save } from '../lib/storage';

const MAX_PICTURES = 3;
// long side in pixels: a screenshot stays readable and three of them fit the upload limit
const MAX_SIDE = 1600;
const DRAFT_KEY = 'feedback:draft';

const KINDS: { id: FeedbackKind; label: string; placeholder: string }[] = [
  {
    id: 'bug',
    label: '🐞 Something’s broken',
    placeholder: 'What did you do, what happened, and what did you expect?',
  },
  {
    id: 'idea',
    label: '💡 Idea',
    placeholder: 'What would you like to change or add?',
  },
  { id: 'other', label: '💬 Something else', placeholder: 'Write anything.' },
];

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
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return `${navigator.userAgent.slice(0, 200)} · window ${window.innerWidth}×${window.innerHeight} · ${theme} theme`;
}

/** A "Feedback" button that opens a form: report a bug, suggest a change or write anything, with screenshots. Goes to the teacher's Telegram. */
export default function Feedback({ docTitle }: { docTitle: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(() => ({ ...EMPTY_DRAFT, ...load<Draft>(DRAFT_KEY) }));
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const update = (changes: Partial<Draft>) =>
    setDraft((previous) => {
      const next = { ...previous, ...changes };
      save(DRAFT_KEY, next);
      return next;
    });

  // previews are object URLs; let them go when the form is done with them
  const previews = useRef<string[]>([]);
  previews.current = pictures.map((picture) => picture.preview);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith('image/'));
    const room = MAX_PICTURES - pictures.length;
    if (!images.length) return;
    if (room <= 0) {
      setError(`You can attach up to ${MAX_PICTURES} pictures.`);
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
      setError('That picture couldn’t be opened. Try a JPEG or PNG.');
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
      setError(failure instanceof ApiError ? failure.message : 'It couldn’t be sent. Try again.');
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

  const kind = KINDS.find((entry) => entry.id === draft.kind) ?? KINDS[0];

  return (
    <>
      <button type="button" className="btn ghost" onClick={open}>
        Feedback
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
            <h2 id="report-title">Thank you!</h2>
            <p>Your message has been sent to the teacher.</p>
            <div className="row-actions">
              <button type="button" className="btn primary" onClick={close}>
                Close
              </button>
              <button type="button" className="btn ghost" onClick={() => setState('idle')}>
                Write another
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
            <h2 id="report-title">Feedback</h2>
            <p className="hint">
              Found a bug, have an idea, or want to say something? It goes straight to the teacher.
            </p>

            <div className="seg report-kinds" role="group" aria-label="What is it about">
              {KINDS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={draft.kind === entry.id}
                  onClick={() => update({ kind: entry.id })}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <label className="report-field">
              <span>Message</span>
              <textarea
                required
                rows={5}
                maxLength={3000}
                value={draft.message}
                placeholder={kind?.placeholder}
                onChange={(event) => update({ message: event.target.value })}
              />
            </label>

            <div className="report-field">
              <span>Pictures (optional)</span>
              <div className="report-pictures">
                {pictures.map((picture, index) => (
                  <figure key={picture.preview}>
                    <img src={picture.preview} alt={`Attached picture ${index + 1}`} />
                    <button
                      type="button"
                      className="report-remove"
                      aria-label={`Remove picture ${index + 1}`}
                      onClick={() => removePicture(index)}
                    >
                      ×
                    </button>
                  </figure>
                ))}
                {pictures.length < MAX_PICTURES && (
                  <label className="btn report-add">
                    + Add a picture
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
              <small className="hint">
                Up to {MAX_PICTURES}. You can also paste a screenshot (Ctrl+V / ⌘V) or drop it here.
              </small>
            </div>

            <label className="report-field">
              <span>Your name or how to reach you (optional)</span>
              <input
                type="text"
                maxLength={200}
                value={draft.contact}
                placeholder="Anna, @anna_tg or anna@mail.com"
                onChange={(event) => update({ contact: event.target.value })}
              />
            </label>

            <p className="hint report-privacy">
              The page you’re on and your browser are added, so the problem is easier to find.
            </p>

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
                {state === 'sending' ? 'Sending…' : 'Send'}
              </button>
              <button type="button" className="btn ghost" onClick={close}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
