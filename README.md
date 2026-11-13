# Cahier de français

A study app for French lessons kept in a Google Doc. The teacher writes lessons in the document; the app turns each lesson into vocabulary, verb tables and exercises for the student.

React + TypeScript + Vite in the browser, small Vercel serverless functions in `api/`. The Anthropic API key stays on the server and never reaches the browser.

## Contents

- [Features](#features)
- [How to write the lesson document](#how-to-write-the-lesson-document)
- [Deploy](#deploy)
- [Using it with students](#using-it-with-students)
- [Optional: adding lessons from photos to the Google Doc](#optional-adding-lessons-from-photos-to-the-google-doc)
- [Pages](#pages)
- [Local development](#local-development)
- [Project structure](#project-structure)
- [Costs](#costs)
- [Limits](#limits)

## Features

**Lessons**

- **Words**: vocabulary extracted by Claude, with Russian translations (ones Claude added are marked ✱), pronunciation 🔊, and ☆ to save a word to My words.
- **Exercises**: quiz, flashcards, translation matching, synonym/antonym matching, fill-the-gap sentences, dictation. Words can be exported for Anki.
- **Verbs**: tables in six tenses, affirmative and negative, a typing drill per tense, and a quick quiz.
- **My notes** (a notepad per lesson) and **Original** (the lesson exactly as written).

**Practice across lessons**

- **Home**: a daily round of 10 mixed questions, a 🔥 streak and a daily goal.
- **All lessons**, **My words**, **Mistakes** and **Stats**.

**From paper**

- **Photo → underlined words**: a photo of a book page gives a translation, dictionary form, tense and short explanation for every underlined word.
- **Photo → handwritten notes**: photos of handwritten notes become a lesson with the same exercises.
- **Photo → textbook PDF**: the pages of a textbook chapter become lesson notes (words, phrases, grammar, examples) and then a lesson.
- Both can be added to the Google Doc as a new lesson (optional setup).

**Around the lessons**

- **Document**: the Google Docs editor inside the app.
- **Next lesson** date and **Join call** button in the top bar, read from the document.
- **Tutorial**: a guide to every section, written for students.

## How to write the lesson document

| What           | Write in the document                          | Notes                                        |
| -------------- | ---------------------------------------------- | -------------------------------------------- |
| Start a lesson | `14.10.2026 1 Leçon` or `14.10.2026 1 Lesson`  | Everything below it belongs to that lesson.  |
| A word         | `bonjour — привет`                             | Messier notes work too; this is clearest.    |
| Pronunciation  | `bonjour [bɔ̃ʒuʁ] — привет`                     | In square brackets, IPA or Cyrillic.         |
| Next lesson    | `le cours prochain: 22.11.2026 18:00 de Paris` | Or `next lesson: …`. The newest line counts. |
| Video call     | `https://meet.google.com/abc-defg-hij`         | Anywhere; the newest link is used.           |

With a city after the time (`de Paris`, `Moscow`…), students see the next lesson in their own time.

## Deploy

About 10 minutes.

1. **Get an Anthropic API key** at console.anthropic.com and add some credit.
2. **Push this folder to a GitHub repository.**
3. **Import it on vercel.com** (New Project → pick the repo). Vercel detects Vite; keep the defaults.
4. **Add environment variables** (Project → Settings → Environment Variables):

   | Variable                            | Required    | What it is                                                              |
   | ----------------------------------- | ----------- | ----------------------------------------------------------------------- |
   | `ANTHROPIC_API_KEY`                 | yes         | Your Anthropic key.                                                     |
   | `APP_ACCESS_CODE`                   | recommended | A class code students enter once, so strangers can’t spend your credit. |
   | `CLAUDE_MODEL`, `CLAUDE_FAST_MODEL` | no          | Model overrides.                                                        |
   | `GOOGLE_SERVICE_ACCOUNT`            | no          | Lets the app add lessons to the Google Doc (setup below).               |

5. **Deploy**, then redeploy once after adding variables so the functions pick them up.

## Using it with students

1. In Google Docs, set the lesson document to **Share → General access → Anyone with the link → Viewer**.
2. Open the app, paste the document link, then press **Copy student link**. It looks like `https://your-app.vercel.app/?doc=DOCUMENT_ID`.
3. Send that link to the student (or the whole class, if they share one document). They open it, enter the class code once, and see every lesson.

When you add a lesson to the document, students press **Sync** to get it. The **Tutorial** page explains the rest of the app to them.

## Optional: adding lessons from photos to the Google Doc

The **Photo** section can append what it read (underlined words, handwritten notes) to the end of the document as a new lesson. Google lets the app write only with its own key, so this needs a one-time setup:

1. Open [console.cloud.google.com](https://console.cloud.google.com), create a project (any name), search for **Google Docs API** and press **Enable**.
2. Go to **IAM & Admin → Service Accounts → Create service account**. Any name; skip the optional roles.
3. Open the new account → **Keys → Add key → Create new key → JSON**. A `.json` file downloads.
4. In Vercel, add the variable `GOOGLE_SERVICE_ACCOUNT` with the **whole contents** of that file as its value. Redeploy.
5. Copy the account’s email (`…@….iam.gserviceaccount.com`; the app also shows it if something is missing) and **Share** the lesson document with it as **Editor**.

The key can edit only documents shared with that email. Keep the JSON file private and never commit it.

## Pages

Every section has its own address, so links can be shared and the browser’s Back button works.

| Page        | Address                                                   |
| ----------- | --------------------------------------------------------- |
| Home        | `/`                                                       |
| Lessons     | `/lessons` (newest), `/lessons/2026-11-12_7` (one lesson) |
| All lessons | `/all-lessons`                                            |
| My words    | `/my-words`                                               |
| Mistakes    | `/mistakes`                                               |
| Stats       | `/stats`                                                  |
| Photo       | `/photo`                                                  |
| Document    | `/document`                                               |
| Tutorial    | `/tutorial`                                               |

`vercel.json` sends every address except `/api/…` to the app, so refreshing any page works.

## Local development

```bash
yarn install
echo "ANTHROPIC_API_KEY=your-key" > .env.local
yarn start   # the UI and the api/ functions together (vercel dev)
```

| Command                             | What it does                                                  |
| ----------------------------------- | ------------------------------------------------------------- |
| `yarn start`                        | Runs the app with its API functions (needs `.env.local`).     |
| `yarn dev`                          | UI only (Vite); documents won’t load without the API.         |
| `yarn build`                        | Type-checks and builds into `dist/`.                          |
| `yarn typecheck`                    | Type-checks the app and the API functions.                    |
| `yarn lint` / `yarn lint:fix`       | ESLint (with Prettier as a rule); `:fix` repairs what it can. |
| `yarn format` / `yarn format:check` | Prettier on every file, or only a check.                      |

In VS Code, the workspace settings in `.vscode/` format and fix files on save (needs the ESLint and Prettier extensions, which VS Code suggests).

## Project structure

```
api/                serverless functions (Vercel)
  _lib/claude.ts    calls to Claude, access code check, photo checks
  _lib/google.ts    writing to Google Docs with the service account
  _lib/prompts.ts   every prompt sent to Claude
  doc.ts            reads the Google Doc
  analyze.ts        prepares a lesson: words, pairs, verbs
  conjugate.ts      a verb’s tables
  gaps.ts           fill-the-gap sentences
  photo.ts          underlined words on a photo
  transcribe.ts     handwritten notes on photos
  textbook.ts       a textbook chapter (PDF pages) as lesson notes
  append.ts         adds a lesson to the Google Doc
  health.ts         what the server is set up for
src/
  App.tsx           top bar, menu and pages
  components/       one file per page or exercise
  lib/              logic without UI: parsing, grading, progress, routing, speech
```

## Costs

Claude is called when a lesson is first prepared, when a verb is first opened, for each new set of gap sentences, and for each photo or PDF. Lessons and verbs are cached in each student’s browser, and warm server instances reuse identical answers, so a class sharing one document mostly pays for each lesson once per student device. Set a monthly spend limit in the Anthropic console.

## Limits

- Progress, stars, notes, streaks and lessons from photos or PDFs live in each browser (localStorage), so they don’t follow a student to another device.
- Private documents can’t be read; they must be shared by link.
- A textbook PDF is read 20 pages at a time; scanned pages are heavy, so a long scanned chapter may need to be split.
- The Google Docs editor in **Document** may not load in browsers that block third-party cookies (often Safari); the page links to the document in a new tab instead.
