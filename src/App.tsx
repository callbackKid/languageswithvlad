import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CodeGate from './components/CodeGate';
import Connect from './components/Connect';
import Discuss from './components/Discuss';
import Feedback from './components/Feedback';
import Home from './components/Home';
import LessonMode from './components/LessonMode';
import LessonView from './components/LessonView';
import Mistakes from './components/Mistakes';
import MyWords from './components/MyWords';
import News from './components/News';
import NextLessonBadge from './components/NextLessonBadge';
import PhotoSection from './components/PhotoSection';
import Practice from './components/Practice';
import Reader from './components/Reader';
import Settings, { Avatar } from './components/Settings';
import Stats from './components/Stats';
import Tutorial from './components/Tutorial';
import { type Translator, translator, useTranslation } from './i18n/core';
import { app } from './i18n/messages/app';
import { api, ApiError } from './lib/api';
import { useBank } from './lib/bank';
import type { BoardServer } from './lib/boardSync';
import { findCall } from './lib/call';
import { useLessonOn, useLiveSync } from './lib/liveSync';
import { hasUnseenNews } from './lib/news';
import { docIdFrom, splitLessons } from './lib/parse';
import { setProgressDoc, useProgress } from './lib/progress';
import { followLink, hrefFor, navigate, usePath } from './lib/router';
import { lessonPath, NEEDS_LESSONS, parsePath, SECTIONS } from './lib/sections';
import { isStudied, useSettings } from './lib/settings';
import { isNotion, sourceUrl } from './lib/source';
import { load, remove, save } from './lib/storage';

interface DocCache {
  title: string;
  text: string;
  fetchedAt: number;
}
type Sync = { state: 'idle' | 'loading' | 'ok' | 'error'; message?: string };

function ago(timestamp: number, { t, locale }: Translator<keyof (typeof app)['en']>): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { count: minutes });
  const hours = Math.round(minutes / 60);
  return hours < 24
    ? t('hoursAgo', { count: hours })
    : new Date(timestamp).toLocaleDateString(locale);
}

// phones show the menu as a list that drops down, so it starts closed there
const PHONE = '(max-width: 760px)';
const onPhone = () => window.matchMedia(PHONE).matches;

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
  const [boardServer, setBoardServer] = useState<BoardServer | null>(null);
  const [docId, setDocId] = useState<string | null>(initialDocId);
  const [doc, setDoc] = useState<DocCache | null>(() =>
    docId ? load<DocCache>('doc:' + docId) : null
  );
  const [sync, setSync] = useState<Sync>({ state: 'idle' });
  const [changing, setChanging] = useState(false);
  const [unseenNews, setUnseenNews] = useState(hasUnseenNews);
  const newsSeen = useCallback(() => setUnseenNews(false), []);
  const [menuOpen, setMenuOpen] = useState(
    () => !onPhone() && load<boolean>('menu-open') !== false
  );
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
        setBoardServer(health.board ?? null);
        if (health.needsCode && !load<string>('code')) setNeedsCode(true);
      })
      .catch(() => {
        /* keep defaults */
      });
    const onCode = () => setNeedsCode(true);
    window.addEventListener('cahier:need-code', onCode);
    return () => window.removeEventListener('cahier:need-code', onCode);
  }, []);

  // Only the newest sync may touch the screen: an answer for a document the user has since
  // switched away from is saved for later, never shown.
  const latestSync = useRef(0);
  // a quiet sync (the live one during a lesson) shows no spinner and keeps the old status if it fails
  const runSync = useCallback(async (id: string, quiet = false) => {
    const syncNumber = ++latestSync.current;
    if (!quiet) setSync({ state: 'loading' });
    try {
      const fetched = await api.doc(id);
      const next = { title: fetched.title, text: fetched.text, fetchedAt: Date.now() };
      save('doc:' + id, next);
      if (syncNumber !== latestSync.current) return;
      setDoc(next);
      setSync({ state: 'ok' });
    } catch (error) {
      if (syncNumber !== latestSync.current || quiet) return;
      setSync({
        state: 'error',
        // read at the moment of failure, so a new interface language doesn't start a sync
        message: error instanceof ApiError ? error.message : translator(app).t('readFailed'),
      });
    }
  }, []);

  useEffect(() => {
    if (docId) void runSync(docId);
  }, [docId, runSync]);
  // leaving the editor pulls in whatever was just written there
  const previousSection = useRef(section);
  useEffect(() => {
    if (previousSection.current === 'document' && section !== 'document' && docId)
      void runSync(docId);
    previousSection.current = section;
  }, [section, docId, runSync]);
  // something was just written into the document (a lesson from a photo)
  useEffect(() => {
    if (!docId) return;
    const onChanged = () => void runSync(docId);
    window.addEventListener('cahier:doc-changed', onChanged);
    return () => window.removeEventListener('cahier:doc-changed', onChanged);
  }, [docId, runSync]);

  // split again only when the text changed: a live sync every minute mostly brings back the same text
  const docText = doc?.text;
  const lessons = useMemo(
    () => (typeof docText === 'string' ? splitLessons(docText) : []),
    [docText]
  );
  const lessonOn = useLessonOn(docText ?? '');
  useLiveSync(lessonOn && !!docId, () => {
    if (docId) void runSync(docId, true);
  });
  const bank = useBank(lessons, ai);
  // Set while rendering, so the first quiz round already sees this document's progress.
  setProgressDoc(docId);
  // the same words the Favourite words page lists
  const hardCount = Object.values(useProgress().words).filter(
    (stat) => stat.hard && isStudied(stat.language, settings)
  ).length;
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
    if (id === docId) void runSync(id);
  }

  if (needsCode)
    return (
      <CodeGate
        onDone={(code) => {
          save('code', code);
          setNeedsCode(false);
          // the first sync was refused for the missing code
          if (docId) void runSync(docId);
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
  else if (sync.state === 'error') status = sync.message || '';
  else if (doc)
    status = t('synced', { count: lessons.length, ago: ago(doc.fetchedAt, translation) });
  else status = t('notSynced');
  const shortDateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  // pages about the lessons have nothing to show until the document has one
  const waitingForLessons = !lessons.length && NEEDS_LESSONS.includes(section);
  const example = (text: string) => <span className="example">{text}</span>;
  const toggleMenu = () => {
    const open = !menuOpen;
    setMenuOpen(open);
    // the choice is kept for wide screens; on a phone the list just closes again
    if (!onPhone()) save('menu-open', open);
  };

  return (
    <>
      <header className="top">
        <Avatar size={40} />
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
        <button
          type="button"
          className="icon-button"
          onClick={() => void runSync(docId)}
          disabled={sync.state === 'loading'}
          title={t('sync')}
          aria-label={t('sync')}
        >
          <span aria-hidden="true">↻</span>
        </button>
        <div className="top-lesson">
          <NextLessonBadge
            text={doc?.text ?? ''}
            action={
              callLink && (
                <a
                  className="btn primary"
                  href={hrefFor('/call')}
                  aria-current={section === 'call' ? 'page' : undefined}
                  onClick={(event) => followLink(event, '/call')}
                >
                  {t('enterLesson')}
                </a>
              )
            }
          />
        </div>
        <div className="top-actions">
          {feedback && <Feedback docTitle={doc?.title ?? ''} />}
          <a
            className="btn ghost"
            href={hrefFor('/settings')}
            aria-current={section === 'settings' ? 'page' : undefined}
            onClick={(event) => followLink(event, '/settings')}
          >
            <span aria-hidden="true">⚙️</span> {t('section.settings')}
          </a>
        </div>
      </header>

      <div className={'shell' + (menuOpen ? '' : ' menu-closed')}>
        <aside className="sidebar">
          <div className="sidebar-inner">
            <button
              type="button"
              className="sidebar-toggle"
              aria-expanded={menuOpen}
              aria-controls="sections-menu"
              title={menuOpen ? t('hideMenu') : t('showMenu')}
              aria-label={menuOpen ? t('hideMenu') : t('showMenu')}
              onClick={toggleMenu}
            >
              <span className="icon-button" aria-hidden="true">
                {menuOpen ? '«' : '☰'}
              </span>
              {/* on a phone the closed menu says where you are */}
              <span className="sidebar-current">{t(`section.${section}`)}</span>
            </button>
            <nav
              id="sections-menu"
              className="sections"
              aria-label={t('sectionsLabel')}
              hidden={!menuOpen}
            >
              {SECTIONS.filter(
                (entry) => entry.inMenu !== false && !settings.hidden.includes(entry.id)
              ).map((entry, index, shown) => (
                <a
                  key={entry.id}
                  // a line above the first section of each group
                  data-group-start={
                    index > 0 && shown[index - 1]?.group !== entry.group ? '' : undefined
                  }
                  className="section-link"
                  href={hrefFor(entry.path)}
                  aria-current={section === entry.id ? 'page' : undefined}
                  onClick={(event) => {
                    if (onPhone()) setMenuOpen(false);
                    followLink(event, entry.path);
                  }}
                >
                  {t(`section.${entry.id}`)}
                  {entry.id === 'mine' && hardCount > 0 && (
                    <span className="count">{hardCount}</span>
                  )}
                  {entry.id === 'news' && unseenNews && (
                    <span
                      className="news-dot"
                      role="img"
                      aria-label={t('newsUnseen')}
                      title={t('newsUnseen')}
                    />
                  )}
                </a>
              ))}
            </nav>
          </div>
        </aside>
        <div className="shell-content">
          {waitingForLessons ? (
            <main className="page">
              <p className="empty">
                {sync.state === 'loading' ? (
                  <>
                    <span className="spinner" /> {t('readingDocument')}
                  </>
                ) : sync.state === 'error' && !doc ? (
                  sync.message
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
            </main>
          ) : section === 'document' && notion ? (
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
                boardServer={boardServer}
                ai={ai}
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
                    docWriter={!!docTarget.docWriter}
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
              {section === 'settings' && (
                <Settings
                  lessonDocument={{
                    title: doc?.title || t('lessonNotes'),
                    url: docUrl,
                    studentLink: `${window.location.origin}/?doc=${encodeURIComponent(docId)}`,
                    onChange: () => setChanging(true),
                  }}
                />
              )}
              {section === 'discuss' && <Discuss bank={bank} ai={ai} />}
              {section === 'photo' && <PhotoSection ai={ai} target={docTarget} />}
              {section === 'text' && <Reader ai={ai} />}
              {section === 'news' && <News onSeen={newsSeen} />}
            </main>
          )}
        </div>
      </div>
    </>
  );
}
