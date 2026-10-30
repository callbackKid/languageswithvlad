import type { ReactNode } from 'react';
import PageHead from './PageHead';

interface Topic {
  id: string;
  title: string;
  body: ReactNode;
}

const TOPICS: Topic[] = [
  {
    id: 'start',
    title: 'Getting started',
    body: (
      <>
        <p>
          Everything comes from one Google Doc with your lesson notes. Each lesson starts with a
          line like <span className="example">14.10.2026 1 Leçon</span> (or{' '}
          <span className="example">Lesson</span> for English), and everything under it until the
          next such line belongs to that lesson.
        </p>
        <ul>
          <li>
            <b>Sync</b> (top right) reads the document again. Press it after adding a new lesson.
          </li>
          <li>
            <b>Open document</b> opens the Google Doc in a new tab. <b>Join call</b> appears when
            the document contains a Google Meet link and opens the newest one.
          </li>
          <li>
            <b>Next lesson</b> (next to Join call) shows the date from the newest line like{' '}
            <span className="example">le cours prochain: 22.11.2026 18:00 de Paris</span> or{' '}
            <span className="example">next lesson: 22.11.2026 18:00</span>. With a city, the time is
            converted to yours. Once that date has passed, or the newest line has no date, it says
            the date isn’t confirmed yet.
          </li>
          <li>
            <b>Copy student link</b> copies a link that opens this document straight away. Students
            may be asked for the class code once.
          </li>
          <li>
            <b>Change document</b> connects a different Google Doc.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'home',
    title: 'Home',
    body: (
      <>
        <p>
          A round of 10 mixed questions from every lesson: pick the translation, pick the French
          word, type the word, listen and write, and a couple of verb forms. Words you get wrong
          come back more often; words you know well come back now and then for review.
        </p>
        <p>
          Above the round you see your <b>streak</b> (🔥 days in a row with at least one answer) and
          today’s <b>goal</b> of 20 answers.
        </p>
      </>
    ),
  },
  {
    id: 'lessons',
    title: 'Lessons',
    body: (
      <>
        <p>
          Pick a lesson on the left. Claude reads it once and prepares its vocabulary, translations
          (✱ marks translations Claude added that aren’t in the notes), synonym and antonym pairs,
          and verbs.
        </p>
        <h3>Words tab</h3>
        <ul>
          <li>
            Tick the words you want to practise, or use <b>Pick all</b>, <b>Clear</b> and the
            filter.
          </li>
          <li>
            🔊 reads a word aloud; ☆ adds it to <b>My words</b>.
          </li>
          <li>
            <b>Quiz</b>: 10 mixed questions. <b>Flashcards</b>: flip with Space, ← again, → I know
            it; works in both directions. <b>Match translations</b>: pair words with their
            translations. <b>Synonyms &amp; antonyms</b>: pair related words. <b>Fill the gap</b>:
            short sentences with a missing word. <b>Dictation</b>: listen and write what you hear.
          </li>
          <li>
            <b>Export words for Anki</b> saves the picked words as a file Anki imports (File →
            Import).
          </li>
          <li>
            <b>Prepare this lesson again</b> asks Claude to read the lesson again, for example after
            you edited it.
          </li>
        </ul>
        <h3>Verbs tab</h3>
        <ul>
          <li>
            Open a verb to see six tenses: présent, passé composé, imparfait, futur simple,
            conditionnel présent and impératif, in the <b>affirmative</b> or <b>negative</b>. 🔊
            reads each form.
          </li>
          <li>
            <b>Practise this tense</b>: fill in the whole table, then check.
          </li>
          <li>
            <b>Quick quiz</b>: random forms of every verb you’ve opened.
          </li>
          <li>
            <b>Conjugate again</b> asks Claude for a fresh table if something looks wrong.
          </li>
        </ul>
        <h3>My notes and Original</h3>
        <p>
          <b>My notes</b> is a notepad for each lesson, saved as you type. <b>Original</b> shows the
          lesson exactly as written in the document.
        </p>
      </>
    ),
  },
  {
    id: 'all',
    title: 'All lessons',
    body: (
      <p>
        The same word and verb exercises, on every prepared lesson at once. Tap lesson chips to
        narrow it down to a few lessons.
      </p>
    ),
  },
  {
    id: 'mine',
    title: 'My words',
    body: (
      <p>
        Your personal list: words you starred and words you got wrong in an exercise. A word leaves
        the list after 3 right answers in a row, or when you take its ★ off. All the word exercises
        work here too. The number next to the section name shows how many words are on the list.
      </p>
    ),
  },
  {
    id: 'mistakes',
    title: 'Mistakes',
    body: (
      <p>The words and verb forms you miss most often, with a button to practise exactly those.</p>
    ),
  },
  {
    id: 'stats',
    title: 'Stats',
    body: (
      <p>
        How many words you’ve learned, which lessons, kinds of words and tenses are hardest for you,
        and your most common mistakes.
      </p>
    ),
  },
  {
    id: 'photo',
    title: 'Photo',
    body: (
      <>
        <h3>Underlined words</h3>
        <p>
          Underline words in a book, take a photo of the page, and get a table: the translation in
          context, the dictionary form (infinitive, masculine singular, noun with article), the
          tense or mood, and a short explanation. 🔊 and ☆ work as everywhere else.
        </p>
        <h3>Handwritten notes</h3>
        <p>
          Take photos of handwritten lesson notes (up to 4 pages at once). Check the recognised text
          and fix anything misread (unreadable words are marked [?]), then press{' '}
          <b>Prepare lesson</b> to get the same words, verbs and exercises as a lesson from the
          document. Earlier notes stay in the list to reopen, edit or delete.
        </p>
        <h3>Add to Google Doc</h3>
        <p>
          Both modes can add what they read to the end of the document as a new lesson, so it
          appears under Lessons after the automatic sync. This needs a one-time setup on the server
          (see the README).
        </p>
      </>
    ),
  },
  {
    id: 'document',
    title: 'Document',
    body: (
      <p>
        The Google Doc editor inside the app. Your changes save to Google Docs as usual, and the
        lessons update when you leave this page. If the editor stays blank or asks you to sign in,
        your browser blocks it here (often Safari): use the link above it to open the document in a
        new tab.
      </p>
    ),
  },
  {
    id: 'storage',
    title: 'Where your data lives',
    body: (
      <p>
        Progress, stars, notes, streaks and handwritten notes are saved in this browser only, so
        they don’t follow you to another device or browser, and clearing the browser’s site data
        removes them.
      </p>
    ),
  },
];

/** A guide to every feature of the app, one short section each. */
export default function Tutorial() {
  return (
    <>
      <PageHead title="Tutorial">What each part of the app does and how to use it.</PageHead>
      <nav className="chips tutorial-toc" aria-label="Tutorial topics">
        {TOPICS.map((topic) => (
          <a key={topic.id} className="chip" href={'#tutorial-' + topic.id}>
            {topic.title}
          </a>
        ))}
      </nav>
      <div className="tutorial">
        {TOPICS.map((topic) => (
          <section key={topic.id} id={'tutorial-' + topic.id} className="tutorial-topic">
            <h2>{topic.title}</h2>
            {topic.body}
          </section>
        ))}
      </div>
    </>
  );
}
