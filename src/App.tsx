import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError } from './lib/api';
import { useBank } from './lib/bank';
import { docIdFrom, splitLessons } from './lib/parse';
import { setProgressDoc, useProgress } from './lib/progress';
import { load, remove, save } from './lib/storage';
import { followLink, hrefFor, navigate, usePath } from './lib/router';
import { lessonPath, parsePath, SECTIONS } from './lib/sections';
import { useTranslation, type Translator } from './i18n/core';
import { app } from './i18n/messages/app';
import Connect from './components/Connect';
import Discuss from './components/Discuss';
import Feedback from './components/Feedback';
import Settings, { Avatar } from './components/Settings';
import { useSettings } from './lib/settings';
import LessonMode from './components/LessonMode';
import { findCall } from './lib/call';
import { isNotion, sourceUrl } from './lib/source';
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

function ago(timestamp: number, { t, locale }: Translator<keyof (typeof app)['en']>): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { count: minutes });
  const hours = Math.round(minutes / 60);
  return hours < 24
    ? t('hoursAgo', { count: hours })
    : new Date(timestamp).toLocaleDateString(locale);
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
  const translation = useTranslation(app);
  const settings = useSettings();
  const { t, rich, locale } = translation;
  const [needsCode, setNeedsCode] = useState(false);
  const [ai, setAi] = useState(true);
  const [docWriter, setDocWriter] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [zoomReady, setZoomReady] = useState(false);
  const [notionReady, setNotionReady] = useState(false);
  const [docId, setDocId] = useState<string | null>(initialDocId);
  const [doc, setDoc] = useState<DocCache | null>(() =>
    docId ? load<DocCache>('doc:' + docId) : null
  );
  const [sync, setSync] = useState<Sync>({ state: 'idle' });
  const [changing, setChanging] = useState(false);
  const [copied, setCopied] = useState(false);
  const route = parsePath(usePath());
  const section = route?.section ?? 'home';
  // an address the app doesn't have goes to Home
  const unknownPath = !route;
  useEffect(() => {
    if (unknownPath) navigate('/', { replace: true });
  }, [unknownPath]);

  useEffect(() => {
    api
      .health()
      .then((health) => {
        setAi(health.ai);
        setDocWriter(health.docWriter ?? null);
        setFeedback(!!health.feedback);
        setZoomReady(!!health.zoom);
        setNotionReady(!!health.notion);
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
        msg: error instanceof ApiError ? error.message : t('readFailed'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the message is read when it fails
  }, []);

  useEffect(() => {
    if (docId) runSync(docId);
  }, [docId, runSync]);
  // leaving the editor pulls in whatever was just written there
  const previousSection = useRef(section);
  useEffect(() => {
    if (previousSection.current === 'document' && section !== 'document' && docId) runSync(docId);
    previousSection.current = section;
  }, [section, docId, runSync]);
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
  // the lesson in the address, or the newest one
  const lesson =
    lessons.find((candidate) => candidate.key === route?.lessonKey) ??
    lessons[lessons.length - 1] ??
    null;
  const currentLessonKey = lesson?.key ?? null;

  function connect(id: string) {
    if (id !== docId) {
      setDoc(load<DocCache>('doc:' + id));
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
      window.prompt(t('copyPrompt'), link);
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

  // the newest Google Meet or Zoom link written anywhere in the document
  const callLink = doc?.text ? findCall(doc.text) : null;
  const notion = isNotion(docId);
  const docTarget = {
    docId,
    // Notion pages are written with the same integration that reads them
    docWriter: notion ? (notionReady ? 'notion' : null) : docWriter,
    nextLessonNumber: Math.max(0, ...lessons.map((listed) => listed.n)) + 1,
  };
  const docUrl = sourceUrl(docId);
  let status: string;
  if (sync.state === 'loading') status = t('syncing');
  else if (sync.state === 'error') status = sync.msg || '';
  else if (doc)
    status = t('synced', { count: lessons.length, ago: ago(doc.fetchedAt, translation) });
  else status = t('notSynced');
  const shortDateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const example = (text: string) => <span className="example">{text}</span>;

  return (
    <>
      <header className="top">
        <div className="doc">
          <p className="doc-title">
            <a href={docUrl} target="_blank" rel="noopener noreferrer">
              {doc?.title || t('lessonNotes')}
            </a>
          </p>
          <div className={'sync-line' + (sync.state === 'error' ? ' err' : '')} role="status">
            {sync.state === 'loading' && <span className="spinner" aria-hidden="true" />} {status}
          </div>
        </div>
        <div className="top-actions">
          {doc?.text && <NextLessonBadge text={doc.text} />}
          {callLink && (
            <a
              className="btn"
              href={hrefFor('/call')}
              aria-current={section === 'call' ? 'page' : undefined}
              onClick={(event) => followLink(event, '/call')}
            >
              {t('joinCall')}
            </a>
          )}
          <a className="btn" href={docUrl} target="_blank" rel="noopener noreferrer">
            {t('openDocument')}
          </a>
          <button
            className="btn primary"
            onClick={() => runSync(docId)}
            disabled={sync.state === 'loading'}
          >
            {t('sync')}
          </button>
          <button className="btn" onClick={copyLink}>
            {copied ? t('linkCopied') : t('copyLink')}
          </button>
          <button className="btn ghost" onClick={() => setChanging(true)}>
            {t('changeDocument')}
          </button>
          {feedback && <Feedback docTitle={doc?.title ?? ''} />}
          <a
            className="avatar-link"
            href={hrefFor('/settings')}
            title={t('section.settings')}
            aria-label={t('section.settings')}
            aria-current={section === 'settings' ? 'page' : undefined}
            onClick={(event) => followLink(event, '/settings')}
          >
            <Avatar />
          </a>
        </div>
      </header>

      {!lessons.length ? (
        <div className="connect">
          <p className="empty">
            {sync.state === 'loading' ? (
              <>
                <span className="spinner" /> {t('readingDocument')}
              </>
            ) : sync.state === 'error' && !doc ? (
              sync.msg
            ) : (
              rich(
                'noLessons',
                {},
                {
                  leçon: example('14.10.2026 1 Leçon'),
                  lesson: example('14.10.2026 1 Lesson'),
                  lektion: example('14.10.2026 1 Lektion'),
                }
              )
            )}
          </p>
        </div>
      ) : (
        <>
          <nav className="sections" aria-label={t('sectionsLabel')}>
            {SECTIONS.filter(
              (entry) => entry.inMenu !== false && !settings.hidden.includes(entry.id)
            ).map((entry) => (
              <a
                key={entry.id}
                className="section-link"
                href={hrefFor(entry.path)}
                aria-current={section === entry.id ? 'page' : undefined}
                onClick={(event) => followLink(event, entry.path)}
              >
                {t(`section.${entry.id}`)}
                {entry.id === 'mine' && hardCount > 0 && <span className="count">{hardCount}</span>}
              </a>
            ))}
          </nav>
          {section === 'document' && notion ? (
            <main className="page">
              <p className="empty">
                {rich('notionDocument', {
                  link: (chunk) => (
                    <a href={docUrl} target="_blank" rel="noopener noreferrer">
                      {chunk}
                    </a>
                  ),
                })}
              </p>
            </main>
          ) : section === 'document' ? (
            <main className="doc-editor">
              <p className="hint">
                {rich('editorHint', {
                  link: (chunk) => (
                    <a href={docUrl} target="_blank" rel="noopener noreferrer">
                      {chunk}
                    </a>
                  ),
                })}
              </p>
              <iframe title="Google Doc" src={docUrl} allow="clipboard-read; clipboard-write" />
            </main>
          ) : section === 'call' ? (
            <main className="page wide">
              <LessonMode
                docText={doc?.text ?? ''}
                docId={docId}
                bank={bank}
                lessons={lessons}
                target={docTarget}
                zoomReady={zoomReady}
              />
            </main>
          ) : section === 'lessons' ? (
            <div className="layout">
              <nav className="lessons" aria-label={t('lessonsLabel')}>
                {lessons.map((listedLesson) => (
                  <a
                    key={listedLesson.key}
                    className="lesson-link"
                    href={hrefFor(lessonPath(listedLesson.key))}
                    aria-current={listedLesson.key === currentLessonKey ? 'page' : undefined}
                    onClick={(event) => followLink(event, lessonPath(listedLesson.key))}
                  >
                    <span className="n">{listedLesson.n}</span>
                    <span className="d">{shortDateFormat.format(listedLesson.date)}</span>
                  </a>
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
              {section === 'settings' && <Settings />}
              {section === 'discuss' && <Discuss bank={bank} ai={ai} />}
              {section === 'photo' && <PhotoSection ai={ai} target={docTarget} />}
            </main>
          )}
        </>
      )}
    </>
  );
}
