import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from './lib/api';
import { useBank } from './lib/bank';
import { docIdFrom, splitLessons } from './lib/parse';
import { setProgressDoc, useProgress } from './lib/progress';
import { load, remove, save } from './lib/storage';
import { plural } from './lib/util';
import Connect from './components/Connect';
import CodeGate from './components/CodeGate';
import Home from './components/Home';
import LessonView from './components/LessonView';
import Mistakes from './components/Mistakes';
import MyWords from './components/MyWords';
import NextLessonBadge from './components/NextLessonBadge';
import PhotoSection from './components/PhotoSection';
import Practice from './components/Practice';
import Stats from './components/Stats';
import Tutorial from './components/Tutorial';

interface DocCache {
  title: string;
  text: string;
  fetchedAt: number;
}
type Sync = { state: 'idle' | 'loading' | 'ok' | 'error'; msg?: string };
type Section =
  | 'home'
  | 'lessons'
  | 'practice'
  | 'mine'
  | 'mistakes'
  | 'stats'
  | 'photo'
  | 'document'
  | 'tutorial';
const SECTIONS: { id: Section; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'practice', label: 'All lessons' },
  { id: 'mine', label: 'My words' },
  { id: 'mistakes', label: 'Mistakes' },
  { id: 'stats', label: 'Stats' },
  { id: 'photo', label: 'Photo' },
  { id: 'document', label: 'Document' },
  { id: 'tutorial', label: 'Tutorial' },
];

const shortDateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

function ago(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : new Date(timestamp).toLocaleDateString();
}

function initialDocId(): string | null {
  const fromUrl = docIdFrom(new URLSearchParams(window.location.search).get('doc') || '');
  if (fromUrl) {
    save('doc', fromUrl);
    return fromUrl;
  }
  return load<string>('doc');
}

export default function App() {
  const [needsCode, setNeedsCode] = useState(false);
  const [ai, setAi] = useState(true);
  const [docWriter, setDocWriter] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(initialDocId);
  const [doc, setDoc] = useState<DocCache | null>(() =>
    docId ? load<DocCache>('doc:' + docId) : null
  );
  const [sync, setSync] = useState<Sync>({ state: 'idle' });
  const [changing, setChanging] = useState(false);
  const [currentLessonKey, setCurrentLessonKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [section, setSection] = useState<Section>('home');

  useEffect(() => {
    api
      .health()
      .then((health) => {
        setAi(health.ai);
        setDocWriter(health.docWriter ?? null);
        if (health.needsCode && !load<string>('code')) setNeedsCode(true);
      })
      .catch(() => {
        /* keep defaults */
      });
    const onCode = () => setNeedsCode(true);
    window.addEventListener('cahier:need-code', onCode);
    return () => window.removeEventListener('cahier:need-code', onCode);
  }, []);

  const runSync = useCallback(async (id: string) => {
    setSync({ state: 'loading' });
    try {
      const fetched = await api.doc(id);
      const next = { title: fetched.title, text: fetched.text, fetchedAt: Date.now() };
      save('doc:' + id, next);
      setDoc(next);
      setSync({ state: 'ok' });
    } catch (error) {
      setSync({
        state: 'error',
        msg: error instanceof ApiError ? error.message : 'Couldn’t read the document.',
      });
    }
  }, []);

  useEffect(() => {
    if (docId) runSync(docId);
  }, [docId, runSync]);
  // something was just written into the document (a lesson from a photo)
  useEffect(() => {
    if (!docId) return;
    const onChanged = () => runSync(docId);
    window.addEventListener('cahier:doc-changed', onChanged);
    return () => window.removeEventListener('cahier:doc-changed', onChanged);
  }, [docId, runSync]);

  const lessons = useMemo(
    () => (typeof doc?.text === 'string' ? splitLessons(doc.text) : []),
    [doc]
  );
  const bank = useBank(lessons, ai);
  // Set while rendering, so the first quiz round already sees this document's progress.
  setProgressDoc(docId);
  const hardCount = Object.values(useProgress().words).filter((stat) => stat.hard).length;
  useEffect(() => {
    if (!lessons.length) return;
    const newest = lessons[lessons.length - 1];
    if (newest && (!currentLessonKey || !lessons.some((lesson) => lesson.key === currentLessonKey)))
      setCurrentLessonKey(newest.key);
  }, [lessons, currentLessonKey]);

  function connect(id: string) {
    if (id !== docId) {
      setDoc(load<DocCache>('doc:' + id));
      setCurrentLessonKey(null);
    }
    save('doc', id);
    setDocId(id);
    setChanging(false);
    const url = new URL(window.location.href);
    url.searchParams.set('doc', id);
    window.history.replaceState(null, '', url);
    if (id === docId) runSync(id);
  }

  async function copyLink() {
    if (!docId) return;
    const link = `${window.location.origin}/?doc=${encodeURIComponent(docId)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy this link for your student:', link);
    }
  }

  if (needsCode)
    return (
      <CodeGate
        onDone={(code) => {
          save('code', code);
          setNeedsCode(false);
        }}
        onClear={() => remove('code')}
      />
    );
  if (!docId || changing)
    return (
      <Connect
        current={docId}
        onConnect={connect}
        onCancel={docId ? () => setChanging(false) : undefined}
      />
    );

  // leaving the editor pulls in whatever was just written
  function openSection(next: Section) {
    if (section === 'document' && next !== 'document' && docId) runSync(docId);
    setSection(next);
  }

  const lesson = lessons.find((candidate) => candidate.key === currentLessonKey) || null;
  // the newest Google Meet link written anywhere in the document
  // (meet.google.com/abc-defg-hij, also with extra path parts like /meet/abc-defg-hij or /lookup/…)
  const meetLinks = doc?.text.match(/https?:\/\/meet\.google\.com(?:\/[\w-]+)+/gi);
  const meetLink = meetLinks ? meetLinks[meetLinks.length - 1] : null;
  const docUrl = `https://docs.google.com/document/d/${encodeURIComponent(docId)}/edit`;
  let status: string;
  if (sync.state === 'loading') status = 'Syncing with Google Docs…';
  else if (sync.state === 'error') status = sync.msg || '';
  else if (doc) status = `${plural(lessons.length, 'lesson')}, synced ${ago(doc.fetchedAt)}`;
  else status = 'Not synced yet';

  return (
    <>
      <header className="top">
        <div className="doc">
          <p className="doc-title">
            <a href={docUrl} target="_blank" rel="noopener noreferrer">
              {doc?.title || 'Lesson notes'}
            </a>
          </p>
          <div className={'sync-line' + (sync.state === 'error' ? ' err' : '')} role="status">
            {sync.state === 'loading' && <span className="spinner" aria-hidden="true" />} {status}
          </div>
        </div>
        <div className="top-actions">
          {doc?.text && <NextLessonBadge text={doc.text} />}
          {meetLink && (
            <a className="btn" href={meetLink} target="_blank" rel="noopener noreferrer">
              Join call
            </a>
          )}
          <a className="btn" href={docUrl} target="_blank" rel="noopener noreferrer">
            Open document
          </a>
          <button
            className="btn primary"
            onClick={() => runSync(docId)}
            disabled={sync.state === 'loading'}
          >
            Sync
          </button>
          <button className="btn" onClick={copyLink}>
            {copied ? 'Link copied' : 'Copy student link'}
          </button>
          <button className="btn ghost" onClick={() => setChanging(true)}>
            Change document
          </button>
        </div>
      </header>

      {!lessons.length ? (
        <div className="connect">
          <p className="empty">
            {sync.state === 'loading' ? (
              <>
                <span className="spinner" /> Reading the document…
              </>
            ) : sync.state === 'error' && !doc ? (
              sync.msg
            ) : (
              <>
                No lessons found yet. Start each lesson in the document with a line like{' '}
                <span className="example">14.10.2026 1 Leçon</span> or{' '}
                <span className="example">14.10.2026 1 Lesson</span>, then press Sync.
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          <nav className="sections" aria-label="Sections">
            {SECTIONS.map((entry) => (
              <button
                key={entry.id}
                className="section-link"
                aria-current={section === entry.id ? 'page' : undefined}
                onClick={() => openSection(entry.id)}
              >
                {entry.label}
                {entry.id === 'mine' && hardCount > 0 && <span className="count">{hardCount}</span>}
              </button>
            ))}
          </nav>
          {section === 'document' ? (
            <main className="doc-editor">
              <p className="hint">
                Edits save to Google Docs and appear in the lessons when you leave this page. If the
                editor asks you to sign in or stays blank, your browser blocks it here:{' '}
                <a href={docUrl} target="_blank" rel="noopener noreferrer">
                  open it in a new tab
                </a>
                .
              </p>
              <iframe title="Google Doc" src={docUrl} allow="clipboard-read; clipboard-write" />
            </main>
          ) : section === 'lessons' ? (
            <div className="layout">
              <nav className="lessons" aria-label="Lessons">
                {lessons.map((listedLesson) => (
                  <button
                    key={listedLesson.key}
                    className="lesson-link"
                    aria-current={listedLesson.key === currentLessonKey}
                    onClick={() => setCurrentLessonKey(listedLesson.key)}
                  >
                    <span className="n">{listedLesson.n}</span>
                    <span className="d">{shortDateFormat.format(listedLesson.date)}</span>
                  </button>
                ))}
              </nav>
              <main>
                {lesson && (
                  <LessonView
                    key={lesson.key}
                    lesson={lesson}
                    docId={docId}
                    ai={ai}
                    onAnalysis={bank.put}
                  />
                )}
              </main>
            </div>
          ) : (
            <main className="page">
              {section === 'home' && <Home bank={bank} />}
              {section === 'practice' && <Practice bank={bank} ai={ai} />}
              {section === 'mine' && <MyWords ai={ai} />}
              {section === 'mistakes' && <Mistakes bank={bank} />}
              {section === 'stats' && <Stats bank={bank} />}
              {section === 'tutorial' && <Tutorial />}
              {section === 'photo' && (
                <PhotoSection
                  ai={ai}
                  target={{
                    docId,
                    docWriter,
                    nextLessonNumber: Math.max(0, ...lessons.map((listed) => listed.n)) + 1,
                  }}
                />
              )}
            </main>
          )}
        </>
      )}
    </>
  );
}
