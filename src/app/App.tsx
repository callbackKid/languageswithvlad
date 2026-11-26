import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  findCall,
  isNotion,
  sourceUrl,
  splitLessons,
  useBank,
  useLessonOn,
  useLiveSync,
} from '@/entities/lesson';
import { hasUnseenNews } from '@/entities/news';
import { setProgressDoc, useProgress } from '@/entities/word';
import { LessonMode } from '@/pages/call';
import { CodeGate } from '@/pages/code-gate';
import { Connect } from '@/pages/connect';
import { LessonDocument } from '@/pages/document';
import { Home } from '@/pages/home';
import { Lessons } from '@/pages/lessons';
import { Mistakes } from '@/pages/mistakes';
import { MyWords } from '@/pages/my-words';
import { News } from '@/pages/news';
import { PhotoSection } from '@/pages/photo';
import { Settings } from '@/pages/settings';
import { Stats } from '@/pages/stats';
import { Reader } from '@/pages/text';
import { Tutorial } from '@/pages/tutorial';
import { api, type BoardServer } from '@/shared/api';
import {
  applyTeacherHealth,
  isStudied,
  NEEDS_LESSONS,
  parsePath,
  SECTIONS,
  useSettings,
} from '@/shared/config';
import { app, type Translator, useTranslation } from '@/shared/i18n';
import { followLink, hrefFor, navigate, usePath } from '@/shared/lib/router';
import { stopSpeaking } from '@/shared/lib/speech';
import { load, loadText, remove, save } from '@/shared/lib/storage';
import Avatar from '@/shared/ui/Avatar';
import { IconButton } from '@/shared/ui/controls';
import SpeechNote from '@/shared/ui/SpeechNote';
import { Discuss } from '@/widgets/discussion';
import { Feedback } from '@/widgets/feedback';
import { NextLessonBadge } from '@/widgets/next-lesson-badge';
import { WordActions } from '@/widgets/word-menu';

import { useDocumentSync } from './model/useDocumentSync';
import TooltipLayer from './TooltipLayer';

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

// the round buttons' icons, drawn on a 16×16 grid around its centre (8, 8): text characters
// (« ☰ ↻) sat off-centre in the circle, by an amount that depends on the font
const ICON_PATHS = {
  fold: 'M7.5 4 3.5 8l4 4M12.5 4l-4 4 4 4',
  menu: 'M3 4.5h10M3 8h10M3 11.5h10',
  sync: 'M14 8a6 6 0 1 1-6-6c1.68 0 3.29.67 4.49 1.83L14 5.33M14 2v3.33h-3.33',
};

// An icon for a round icon button, in the text colour.
function ButtonIcon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// The whole app: the top bar, the menu and the page of the current address.
export default function App({ initialDocId }: { initialDocId: string | null }) {
  const translation = useTranslation(app);
  const settings = useSettings();
  const { t, rich } = translation;
  const [needsCode, setNeedsCode] = useState(false);
  const [hasClaude, setHasClaude] = useState(true);
  const [docWriter, setDocWriter] = useState<string | null>(null);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [zoomReady, setZoomReady] = useState(false);
  // the JaaS AppID when video calls on Jitsi run inside the app
  const [jitsiAppId, setJitsiAppId] = useState<string | null>(null);
  const [notionReady, setNotionReady] = useState(false);
  const [boardServer, setBoardServer] = useState<BoardServer | null>(null);
  const { docId, doc, sync, selectDocument, syncDocument } = useDocumentSync(initialDocId);
  const [changing, setChanging] = useState(false);
  const [unseenNews, setUnseenNews] = useState(hasUnseenNews);
  const newsSeen = useCallback(() => setUnseenNews(false), []);
  const [menuOpen, setMenuOpen] = useState(
    () => !onPhone() && load<boolean>('menu-open') !== false
  );
  const path = usePath();
  const route = parsePath(path);
  // a word still being read aloud stops with the page it belongs to, and when the tab is hidden
  useEffect(() => stopSpeaking(), [path]);
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stopSpeaking();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  const section = route?.section ?? 'home';
  // a page that is a tab of another section keeps that section's menu link current
  const menuSection = SECTIONS.find((entry) => entry.id === section)?.tabOf ?? section;
  // an address the app doesn't have goes to Home
  const unknownPath = !route;
  // an address the app doesn't have: Home shows instead, with a note naming it until the next page
  const [missedPath, setMissedPath] = useState<string | null>(null);
  useEffect(() => {
    if (unknownPath) {
      setMissedPath(path);
      navigate('/', { replace: true });
    } else if (path !== '/') setMissedPath(null);
  }, [unknownPath, path]);

  useEffect(() => {
    api
      .health()
      .then((health) => {
        setHasClaude(health.ai);
        setDocWriter(health.docWriter ?? null);
        setHasFeedback(!!health.feedback);
        setZoomReady(!!health.zoom);
        setJitsiAppId(health.jitsi ?? null);
        setNotionReady(!!health.notion);
        setBoardServer(health.board ?? null);
        applyTeacherHealth(!!health.teacherCode, !!health.teacher);
        if (health.needsCode && !loadText('code')) setNeedsCode(true);
      })
      .catch(() => {
        // keep defaults
      });
    const onCode = () => setNeedsCode(true);
    window.addEventListener('cahier:need-code', onCode);
    return () => window.removeEventListener('cahier:need-code', onCode);
  }, []);

  // leaving the editor pulls in whatever was just written there
  const previousSection = useRef(section);
  useEffect(() => {
    if (previousSection.current === 'document' && section !== 'document') void syncDocument();
    previousSection.current = section;
  }, [section, syncDocument]);
  // something was just written into the document (a lesson from a photo)
  useEffect(() => {
    const onChanged = () => void syncDocument();
    window.addEventListener('cahier:doc-changed', onChanged);
    return () => window.removeEventListener('cahier:doc-changed', onChanged);
  }, [syncDocument]);

  // split again only when the text changed: a live sync every minute mostly brings back the same text
  const docText = doc?.text;
  const lessons = useMemo(
    () => (typeof docText === 'string' ? splitLessons(docText) : []),
    [docText]
  );
  const lessonOn = useLessonOn(docText ?? '');
  useLiveSync(lessonOn && !!docId, () => {
    void syncDocument(true);
  });
  const bank = useBank(lessons, hasClaude);
  // the same words the Words to learn page lists
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
    setProgressDoc(id);
    selectDocument(id);
    setChanging(false);
    const url = new URL(window.location.href);
    url.searchParams.set('doc', id);
    window.history.replaceState(null, '', url);
  }

  if (needsCode)
    return (
      <CodeGate
        onDone={(code) => {
          save('code', code);
          setNeedsCode(false);
          // the first sync was refused for the missing code
          void syncDocument();
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
  else if (sync.state === 'error') status = sync.message;
  else if (doc)
    status = t('synced', { count: lessons.length, ago: ago(doc.fetchedAt, translation) });
  else status = t('notSynced');
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
        <IconButton
          onClick={() => void syncDocument()}
          disabled={sync.state === 'loading'}
          label={t('sync')}
        >
          <ButtonIcon name="sync" />
        </IconButton>
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
          {hasFeedback && <Feedback docTitle={doc?.title ?? ''} />}
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
            <IconButton
              className="sidebar-toggle"
              aria-expanded={menuOpen}
              aria-controls="sections-menu"
              label={menuOpen ? t('hideMenu') : t('showMenu')}
              onClick={toggleMenu}
            >
              <span className="icon-button" aria-hidden="true">
                <ButtonIcon name={menuOpen ? 'fold' : 'menu'} />
              </span>
              {/* on a phone the closed menu says where you are */}
              <span className="sidebar-current">{t(`section.${menuSection}`)}</span>
            </IconButton>
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
                  aria-current={menuSection === entry.id ? 'page' : undefined}
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
                      data-tooltip={t('newsUnseen')}
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
          ) : section === 'document' ? (
            <LessonDocument url={docUrl} isNotion={notion} />
          ) : section === 'call' ? (
            <main className="page wide">
              <LessonMode
                docText={doc?.text ?? ''}
                docId={docId}
                bank={bank}
                lessons={lessons}
                target={docTarget}
                zoomReady={zoomReady}
                jitsiAppId={jitsiAppId}
                boardServer={boardServer}
                hasClaude={hasClaude}
              />
            </main>
          ) : section === 'lessons' || section === 'practice' ? (
            <Lessons
              tab={section}
              lessons={lessons}
              lesson={lesson}
              bank={bank}
              docId={docId}
              hasClaude={hasClaude}
              canWrite={!!docTarget.docWriter}
            />
          ) : (
            <main className="page">
              {section === 'home' && missedPath && (
                <div className="note info" role="status">
                  <p>{t('unknownAddress', { path: missedPath })}</p>
                </div>
              )}
              {section === 'home' && (
                <Home
                  bank={bank}
                  lessons={lessons}
                  hasClaude={hasClaude}
                  docId={docId}
                  docText={doc?.text ?? ''}
                  canWrite={!!docTarget.docWriter}
                />
              )}
              {section === 'mine' && <MyWords hasClaude={hasClaude} />}
              {section === 'mistakes' && <Mistakes bank={bank} />}
              {section === 'stats' && (
                <Stats
                  bank={bank}
                  lessons={lessons}
                  docId={docId}
                  canWrite={!!docTarget.docWriter}
                />
              )}
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
              {section === 'discuss' && <Discuss bank={bank} hasClaude={hasClaude} />}
              {section === 'photo' && (
                <PhotoSection hasClaude={hasClaude} target={docTarget} lessons={lessons} />
              )}
              {section === 'text' && <Reader hasClaude={hasClaude} />}
              {section === 'news' && <News onSeen={newsSeen} />}
            </main>
          )}
        </div>
      </div>
      {/* a new page or lesson closes the menu */}
      <WordActions
        key={`${section}:${currentLessonKey ?? ''}`}
        hasClaude={hasClaude}
        docId={docId}
        lesson={section === 'lessons' || section === 'call' ? lesson : null}
        canWrite={!!docTarget.docWriter}
      />
      <SpeechNote />
      <TooltipLayer />
    </>
  );
}
