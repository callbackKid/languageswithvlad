import type { ReactNode } from 'react';
import { followLink, hrefFor } from '../lib/router';
import { SECTIONS, type Section } from '../lib/sections';
import PageHead from './PageHead';

/* A guide for someone opening the app for the first time: a quick start, a map of the sections,
   then one card per section with what it is for, how to use it, a small picture of the screen
   and a link that opens it. The pictures are drawings, not working controls. */

/** A drawn button, looking like the real one. */
const Button = ({ children, primary }: { children: ReactNode; primary?: boolean }) => (
  <span className={'mock-btn' + (primary ? ' primary' : '')}>{children}</span>
);
const Key = ({ children }: { children: ReactNode }) => <kbd className="key">{children}</kbd>;
/** A small drawing of part of the screen. */
const Mock = ({ label, children }: { label: string; children: ReactNode }) => (
  <figure className="mock" aria-label={'Picture of ' + label}>
    <div className="mock-body" aria-hidden="true">
      {children}
    </div>
    <figcaption>{label}</figcaption>
  </figure>
);

function OpenLink({ section, children }: { section: Section; children?: ReactNode }) {
  const entry = SECTIONS.find((candidate) => candidate.id === section);
  if (!entry) return null;
  return (
    <a
      className="open-link"
      href={hrefFor(entry.path)}
      onClick={(event) => followLink(event, entry.path)}
    >
      {children ?? `Open ${entry.label}`} →
    </a>
  );
}

interface Guide {
  section: Section | null;
  id: string;
  icon: string;
  title: string;
  /** one line for the map at the top */
  summary: string;
  /** what the section is for */
  intro: ReactNode;
  steps: ReactNode[];
  mock?: ReactNode;
  tips?: ReactNode[];
}

const GUIDES: Guide[] = [
  {
    section: null,
    id: 'header',
    icon: '🧭',
    title: 'The top bar',
    summary: 'Document, sync, next lesson, the call link and feedback',
    intro: (
      <p>
        The bar at the top is always there. It shows which Google Doc the app reads and when it last
        synced, plus the next lesson and the video call.
      </p>
    ),
    steps: [
      <>
        <b>Sync</b> reads the document again: press it after the teacher adds a lesson.
      </>,
      <>
        <b>Next lesson</b> shows the date from the newest line like{' '}
        <span className="example">le cours prochain: 22.11.2026 18:00 de Paris</span>. A time given
        for a city is converted to yours. When the date has passed it says “not confirmed yet”.
      </>,
      <>
        <b>Join call</b> appears when the document has a Google Meet link and opens the newest one.
      </>,
      <>
        <b>Open document</b> opens the Google Doc in a new tab. <b>Copy student link</b> copies a
        link that opens this document straight away. <b>Change document</b> connects another one.
      </>,
      <>
        <b>Feedback</b> sends a message to the teacher: a bug, an idea or anything else. Add up to 3
        screenshots, or paste one with Ctrl+V / ⌘V. The page you were on is added automatically.
      </>,
    ],
    mock: (
      <Mock label="the top bar">
        <div className="mock-row">
          <span className="mock-text">
            Next lesson: <b>tomorrow, 18:00</b>
          </span>
          <Button>Join call</Button>
          <Button>Open document</Button>
          <Button primary>Sync</Button>
          <Button>Copy student link</Button>
        </div>
      </Mock>
    ),
    tips: [
      <>
        A lesson in the document starts with a line like{' '}
        <span className="example">14.10.2026 1 Leçon</span> (or{' '}
        <span className="example">Lesson</span>, <span className="example">Lektion</span>).
        Everything under it, up to the next such line, belongs to that lesson.
      </>,
    ],
  },
  {
    section: 'home',
    id: 'home',
    icon: '🏠',
    title: 'Home',
    summary: 'A daily round of 10 mixed questions',
    intro: (
      <p>
        The quickest way to practise every day: 10 questions from all your lessons, with the words
        you miss coming back more often.
      </p>
    ),
    steps: [
      <>
        Answer each question: pick a translation, pick the French word, type it, or write what you
        hear.
      </>,
      <>
        After each answer press <Button primary>Next</Button>. At the end you see your score and{' '}
        <Button primary>Next round</Button>.
      </>,
      <>Answer at least once a day to keep your 🔥 streak; 20 answers complete the day’s goal.</>,
    ],
    mock: (
      <Mock label="the streak and daily goal on Home">
        <div className="mock-row">
          <b>🔥 4 days in a row</b>
          <span className="mock-bar">
            <span style={{ width: '60%' }} />
          </span>
          <span className="mock-text">Today: 12 of 20 answers</span>
        </div>
      </Mock>
    ),
  },
  {
    section: 'lessons',
    id: 'lessons',
    icon: '📚',
    title: 'Lessons',
    summary: 'Words, verbs and notes for each lesson',
    intro: (
      <p>
        Every lesson from the document, newest selected. Claude reads it once and prepares the
        vocabulary with translations, synonym and antonym pairs, and the verbs.
      </p>
    ),
    steps: [
      <>Pick a lesson in the list on the left (each lesson has its own link you can share).</>,
      <>
        Stay on the <b>Words</b> tab. Every word is ticked; untick the ones you don’t want, or use{' '}
        <b>Pick all</b>, <b>Clear</b> and the filter box.
      </>,
      <>
        Start an exercise from the row of buttons: <Button primary>Quiz</Button>{' '}
        <Button>Flashcards</Button> <Button>Match translations</Button>{' '}
        <Button>Synonyms &amp; antonyms</Button> <Button>Fill the gap</Button>{' '}
        <Button>Dictation</Button>
      </>,
      <>
        Press 🔊 to hear a word and ☆ to put it on <b>My words</b>.
      </>,
    ],
    mock: (
      <Mock label="the Words tab of a lesson">
        <div className="mock-tabs">
          <span className="on">
            Words <i>24</i>
          </span>
          <span>
            Verbs <i>5</i>
          </span>
          <span>My notes</span>
          <span>Original</span>
        </div>
        <div className="mock-row">
          <Button primary>Quiz</Button>
          <Button>Flashcards</Button>
          <Button>Match translations</Button>
          <Button>Dictation</Button>
        </div>
        <div className="mock-word">
          <span className="tick">☑</span>
          <span className="fr">bonjour</span>
          <span className="tr">[bɔ̃ʒuʁ]</span>
          <span className="ru">привет</span>
          <span>🔊</span>
          <span>☆</span>
        </div>
        <div className="mock-word">
          <span className="tick">☑</span>
          <span className="fr">la boulangerie</span>
          <span className="ru">
            пекарня <span className="added">✱</span>
          </span>
          <span>🔊</span>
          <span>★</span>
        </div>
      </Mock>
    ),
    tips: [
      <>
        <span className="added">✱</span> marks a translation Claude added that isn’t in the notes.
      </>,
      <>
        <b>Flashcards</b>: <Key>Space</Key> flips the card, <Key>←</Key> means “again”, <Key>→</Key>{' '}
        means “I know it”. The toggle on top switches FR → RU and RU → FR.
      </>,
      <>
        At the bottom: <b>Export words for Anki</b> saves the ticked words as a file (in Anki: File
        → Import), and <b>Prepare this lesson again</b> asks Claude to re-read an edited lesson.
      </>,
      <>
        <b>My notes</b> is your notepad for the lesson, saved as you type. <b>Original</b> shows the
        lesson exactly as written.
      </>,
    ],
  },
  {
    section: 'lessons',
    id: 'verbs',
    icon: '🔤',
    title: 'Verbs',
    summary: 'Conjugation tables and drills (Verbs tab of a lesson)',
    intro: (
      <p>
        The <b>Verbs</b> tab of a lesson has a conjugation table for every verb in it, in six
        tenses, affirmative and negative.
      </p>
    ),
    steps: [
      <>Press a verb to open its table.</>,
      <>
        Choose a tense (présent, passé composé, imparfait, futur simple, conditionnel présent,
        impératif) and <b>affirmative</b> or <b>negative</b>. 🔊 reads each form.
      </>,
      <>
        Press <Button primary>Practise this tense</Button>, fill in every person, then{' '}
        <Button primary>Check answers</Button>. Wrong forms show the right one underneath.
      </>,
      <>
        <Button>Quick quiz</Button> asks random forms of every verb you’ve opened.
      </>,
    ],
    mock: (
      <Mock label="a verb table">
        <div className="mock-row">
          <span className="mock-pill on">présent</span>
          <span className="mock-pill">passé composé</span>
          <span className="mock-pill">imparfait</span>
          <span className="mock-pill">futur simple</span>
        </div>
        <div className="mock-table">
          <span>je</span>
          <span className="fr">me réveille 🔊</span>
          <span>tu</span>
          <span className="fr">te réveilles 🔊</span>
          <span>nous</span>
          <span className="fr">nous réveillons 🔊</span>
        </div>
      </Mock>
    ),
    tips: [
      <>Type a form with or without the pronoun: both “nous réveillons” and “réveillons” count.</>,
      <>
        Capital letters and punctuation don’t matter. A missing accent counts as “almost”, not
        wrong.
      </>,
      <>
        If a table looks wrong, <b>Conjugate again</b> (next to the past participle) asks for a
        fresh one.
      </>,
    ],
  },
  {
    section: 'practice',
    id: 'all-lessons',
    icon: '🗂️',
    title: 'All lessons',
    summary: 'The same exercises, on several lessons at once',
    intro: <p>Every word and verb exercise, on all prepared lessons together.</p>,
    steps: [
      <>
        Leave <b>All</b> selected, or tap lesson chips to practise only a few lessons.
      </>,
      <>
        Use the <b>Words</b> and <b>Verbs</b> tabs exactly as in a single lesson.
      </>,
    ],
    mock: (
      <Mock label="lesson chips">
        <div className="mock-row">
          <span className="mock-pill on">All</span>
          <span className="mock-pill">Leçon 5</span>
          <span className="mock-pill">Leçon 6</span>
          <span className="mock-pill">Leçon 7</span>
        </div>
      </Mock>
    ),
  },
  {
    section: 'mine',
    id: 'my-words',
    icon: '⭐',
    title: 'My words',
    summary: 'Your personal list of words to work on',
    intro: (
      <p>
        Words you starred with ☆ and words you got wrong in any exercise. The number next to{' '}
        <b>My words</b> in the menu shows how many there are.
      </p>
    ),
    steps: [
      <>Practise them with the same exercises as in a lesson.</>,
      <>
        A word leaves the list after <b>3 right answers in a row</b>, or when you take its ★ off.
      </>,
    ],
  },
  {
    section: 'mistakes',
    id: 'mistakes',
    icon: '🎯',
    title: 'Mistakes',
    summary: 'The words and verb forms you miss most',
    intro: (
      <p>Your most frequent mistakes, words and verb forms, with how often you missed each.</p>
    ),
    steps: [
      <>
        Press <Button primary>Practise my mistakes</Button> for a round made only of them.
      </>,
    ],
  },
  {
    section: 'stats',
    id: 'stats',
    icon: '📊',
    title: 'Stats',
    summary: 'Your progress and weak spots',
    intro: (
      <p>
        How many words you’ve learned, which lessons, kinds of words and tenses are hardest for you,
        and your most common mistakes.
      </p>
    ),
    steps: [<>Check it now and then to choose what to review next.</>],
  },
  {
    section: 'photo',
    id: 'photo',
    icon: '📷',
    title: 'Photo',
    summary: 'Underlined words, handwritten notes, or a textbook PDF',
    intro: <p>Three ways to bring words in from paper. Choose one with the switch at the top.</p>,
    steps: [
      <>
        <b>Underlined words</b>: underline words in a book, press{' '}
        <Button primary>Choose or take a photo</Button>, and get a table with the translation in
        context, the dictionary form, the tense and a short explanation.
      </>,
      <>
        <b>Handwritten notes</b>: photograph up to 4 pages of notes, fix anything misread
        (unreadable words are marked [?]), then press <Button primary>Prepare lesson</Button> to get
        words, verbs and exercises as for any lesson.
      </>,
      <>
        <b>Textbook PDF</b>: press <Button primary>Choose a PDF</Button>, enter the pages of one
        chapter (up to 20), then <Button primary>Read these pages</Button>. Claude writes lesson
        notes: words, phrases, grammar and examples. Check them and press{' '}
        <Button primary>Prepare lesson</Button>.
      </>,
      <>
        <Button>Add to Google Doc as Leçon 8</Button> adds what was read to the end of the document
        as a new lesson (needs a one-time setup on the server, see the README).
      </>,
    ],
    mock: (
      <Mock label="the result of a photo with underlined words">
        <div className="mock-photo">
          <span className="head">Underlined</span>
          <span className="head">Translation</span>
          <span className="head">Form</span>
          <span className="fr">avait raison</span>
          <span>был прав</span>
          <span>
            <i>avoir raison</i> · imparfait
          </span>
          <span className="fr">assommé</span>
          <span>оглушённый</span>
          <span>
            <i>assommer</i> · participe passé
          </span>
        </div>
      </Mock>
    ),
    tips: [
      <>Take the photo straight on, in good light, with the whole marked line in the frame.</>,
      <>☆ next to a word puts its dictionary form on My words.</>,
    ],
  },
  {
    section: 'discuss',
    id: 'discuss',
    icon: '💬',
    title: 'Discuss',
    summary: 'A discussion question to start the lesson',
    intro: (
      <p>
        A question to talk about at the start of a lesson, written for your level and the grammar
        you are practising.
      </p>
    ),
    steps: [
      <>
        Choose the language and your <b>level</b> (A1–C2).
      </>,
      <>
        Pick a <b>vocabulary topic</b>: from the list, from your lessons, or <b>Other…</b> to type
        your own. Pick a <b>grammar topic</b>, or leave <b>Any</b>.
      </>,
      <>
        Press <Button primary>Write a question</Button>. You get the question (🔊 reads it,{' '}
        <b>Show translation</b> shows it in Russian), follow-up questions, sentence beginnings that
        use the grammar, and useful words.
      </>,
      <>
        <Button primary>Another question</Button> writes a new one with the same settings.
      </>,
    ],
    tips: [<>☆ next to a useful word puts it on My words.</>],
  },
  {
    section: 'document',
    id: 'document',
    icon: '📝',
    title: 'Document',
    summary: 'Edit the Google Doc without leaving the app',
    intro: <p>The Google Docs editor inside the app, for writing lessons.</p>,
    steps: [
      <>Edit as usual: changes save to Google Docs.</>,
      <>When you go to another section, the app syncs and the lessons update.</>,
    ],
    tips: [
      <>
        If the editor stays blank or asks you to sign in (often in Safari), use the link above it to
        open the document in a new tab.
      </>,
    ],
  },
];

const QUICK_START: { title: string; text: ReactNode }[] = [
  {
    title: 'Open your lesson document',
    text: <>Use the link from your teacher. Enter the class code if asked (only once).</>,
  },
  {
    title: 'Pick a lesson',
    text: (
      <>
        In <OpenLink section="lessons">Lessons</OpenLink>, choose a lesson and look at its words.
      </>
    ),
  },
  {
    title: 'Practise',
    text: (
      <>
        Start with <b>Flashcards</b>, then the <b>Quiz</b>. Missed words go to{' '}
        <OpenLink section="mine">My words</OpenLink>.
      </>
    ),
  },
  {
    title: 'Come back every day',
    text: (
      <>
        A round on <OpenLink section="home">Home</OpenLink> takes a few minutes and keeps your 🔥
        streak going.
      </>
    ),
  },
];

/** A guide to every part of the app, for someone using it for the first time. */
export default function Tutorial() {
  return (
    <>
      <PageHead title="Tutorial">
        How the app works, in a few minutes. Every section below has a link that opens it.
      </PageHead>

      <section className="tutorial-block" aria-labelledby="quick-start">
        <h2 id="quick-start">Quick start</h2>
        <ol className="quick-start">
          {QUICK_START.map((step, position) => (
            <li key={step.title}>
              <span className="step-number">{position + 1}</span>
              <b>{step.title}</b>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tutorial-block" aria-labelledby="map">
        <h2 id="map">What’s where</h2>
        <div className="guide-map">
          {GUIDES.map((guide) => (
            <a key={guide.id} className="guide-card" href={'#guide-' + guide.id}>
              <span className="icon" aria-hidden="true">
                {guide.icon}
              </span>
              <b>{guide.title}</b>
              <span>{guide.summary}</span>
            </a>
          ))}
        </div>
      </section>

      {GUIDES.map((guide) => (
        <section key={guide.id} id={'guide-' + guide.id} className="guide">
          <header className="guide-head">
            <h2>
              <span className="icon" aria-hidden="true">
                {guide.icon}
              </span>{' '}
              {guide.title}
            </h2>
            {guide.section && <OpenLink section={guide.section} />}
          </header>
          {guide.intro}
          <div className={'guide-body' + (guide.mock ? ' with-mock' : '')}>
            <div>
              <h3>How to use it</h3>
              <ol className="guide-steps">
                {guide.steps.map((step, position) => (
                  <li key={position}>{step}</li>
                ))}
              </ol>
              {guide.tips && (
                <>
                  <h3>Good to know</h3>
                  <ul className="guide-tips">
                    {guide.tips.map((tip, position) => (
                      <li key={position}>{tip}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            {guide.mock}
          </div>
          <a className="back-to-top" href="#map">
            ↑ Back to the map
          </a>
        </section>
      ))}

      <section className="guide" id="guide-storage">
        <h2>
          <span className="icon" aria-hidden="true">
            💾
          </span>{' '}
          Where your data lives
        </h2>
        <p>
          Progress, stars, notes, streaks and handwritten notes are saved in this browser only. They
          don’t follow you to another device or browser, and clearing the browser’s site data
          removes them.
        </p>
      </section>
    </>
  );
}
